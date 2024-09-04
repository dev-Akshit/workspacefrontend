import React, {
	useCallback, useState, useEffect, useMemo,
} from 'react';

import { DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import {
	Popover, Image, Popconfirm, Tooltip, message as alertMessage,
} from 'antd';
import Linkify from 'react-linkify';
import styles from './reply.module.css';
import { UserAvatar } from '../avatar';
import { getReplyTimeString } from '../../libs/utils';
import { UserDetailsCard } from '../user-details-card';
import {
	UserRoles, ReplyEventKind, MessageEventKind, channelWritePermissionType,
} from '../../config';
import { FileAttachment } from '../file-attachment';

interface ReplyProps {
	sessionData: any | null
	message: any | null
	isSidebarEmbed?: boolean
	messageParent: any | null
	messageReplyId?: string | undefined
	channelUsers?: any | null
	currentChannelPermission: any | null
	deleteReply: (
		replyId: string,
		messageId: string
	) => Promise<void>

	setMessageReplyId: (messageId: string) => void
}

export const Reply: React.FC<ReplyProps> = (props) => {
	const {
		sessionData, message, messageParent, deleteReply, setMessageReplyId,
		messageReplyId,
		currentChannelPermission,
		channelUsers,
		isSidebarEmbed,
	} = props;

	const [deleteLoader, setDeleteLoader] = useState(false);
	const [deleteVisible, setdeleteVisible] = useState(false);
	const [tokenMessage, setTokenMessage] = useState<[]>([]);
	const showPopconfirmDelete = () => {
		setdeleteVisible(true);
	};

	const handleDeleteReply = useCallback(
		async () => {
			try {
				setDeleteLoader(true);
				const messageId = messageParent.id;
				const replyId = message.id;
				await deleteReply(replyId, messageId);
				setDeleteLoader(false);
				alertMessage.success('Message deleted');
			} catch (error) {
				console.log(error);
				alertMessage.error('Message delete failed');
			}
		}, [messageParent, message, deleteReply],
	);

	const handleEditReply = useCallback((messageId: string) => {
		setMessageReplyId(messageId);
	}, [setMessageReplyId]);

	const copyThisMessage = useCallback(
		async () => {
			try {
				await navigator.clipboard.writeText(message.content);
				alertMessage.success('Text copied');
			} catch (error) {
				console.log(error);
				alertMessage.error('Failed');
			}
		}, [message],
	);

	useEffect(() => {
		const arr = [] as any;
		let currentIndex = 0;
		message.mentions.map((val: any) => {
			const len = val.display.length;
			const startIndex = val.plainTextIndex;
			arr.push(message.content.substring(currentIndex, startIndex));
			arr.push(message.content.substring(startIndex, startIndex + len));
			currentIndex = startIndex + len;
			return len;
		});
		if (currentIndex < message.content.length) {
			arr.push(message.content.substring(currentIndex));
		}
		setTokenMessage(arr);
	}, [message.mentions, message.content]);

	return (
		<div className={styles.replyWrapper}>
			<div className={styles.avatarContainer}>
				<UserAvatar
					id={message.created_by?._id ?? ''}
					src={sessionData?.userId === message.created_by?._id ? sessionData?.profilePic : ''}
					displayName={message.created_by?.displayname ?? ''}
					size={25}
					style={{ fontSize: 12 }}
				/>
			</div>
			<div className={styles.reply}>
				{
					message.status === ReplyEventKind.Add || message.status === ReplyEventKind.Edit ? (
						<>
							<span
								className={styles.replyTimestamp}
							>
								{getReplyTimeString(+message.created_at)}

							</span>
							<div className={styles.messageActionContainer}>
								{sessionData?.userId === message.created_by?._id || (sessionData?.role !== '1' && message.created_by?.role === '1') ? (
									<Popconfirm
										title="Are you sure you want to delete this message?"
										// visible={deleteVisible}
										onConfirm={handleDeleteReply}
										okButtonProps={{ loading: deleteLoader }}
										onCancel={() => setdeleteVisible(false)}
										getPopupContainer={(trigger) => trigger.parentElement || document.body}
									>
										<Tooltip
											title="Delete message"
											getPopupContainer={
												(trigger) => trigger.parentElement || document.body
											}
										>
											<DeleteOutlined />
										</Tooltip>
									</Popconfirm>
								) : ''}
								{(sessionData?.userId === message.created_by?._id) && (currentChannelPermission === channelWritePermissionType.everyone || sessionData?.role !== '1') && (
									<Tooltip
										title="Edit message"
										getPopupContainer={
											(trigger) => trigger.parentElement || document.body
										}
									>
										<EditOutlined onClick={() => handleEditReply(message.id)} />
									</Tooltip>
								)}
								<Tooltip
									title="Copy text"
									getPopupContainer={
										(trigger) => trigger.parentElement || document.body
									}
								>
									<CopyOutlined onClick={copyThisMessage} />
								</Tooltip>
							</div>
						</>
					) : (
						<span
							className={styles.replyTimestamp}
						>
							{getReplyTimeString(+message.deleted_at)}

						</span>
					)
				}
				<div className={`${styles.replyContent} selectable`}>
					<Popover
						trigger={['click']}
						placement="right"
						content={(
							<UserDetailsCard
								id={message.created_by?._id}
								src={sessionData?.userId === message.created_by?._id ? sessionData?.profilePic : ''}
								displayName={message.created_by?.displayname}
								email={message.created_by?.email}
								showEmail={sessionData?.role !== UserRoles.User}
							/>
						)}
						getPopupContainer={(trigger) => trigger.parentElement || document.body}
					>
						<span>{message.created_by?.displayname}</span>
					</Popover>
					<span> - </span>
					{message.status === ReplyEventKind.Add || message.status === ReplyEventKind.Edit ? (
						<Linkify
							componentDecorator={(href, text, key) => (
								<a href={href} key={key} target="_blank" rel="noopener noreferrer">
									{text}
								</a>
							)}
						>
							<pre>
								{
									tokenMessage.map(
										(el: string) => {
											const foundIndex = message?.mentions?.findIndex((e: any) => e.display === el);
											if (foundIndex >= 0) {
												const mention = message?.mentions?.[foundIndex];

												return (
													<span
														key={`${mention?.id}-${mention.plainTextIndex}`}
														className={styles.mentionInMessage}
													>
														{el}
													</span>
												);
											}
											return el;
										},
									)
								}
							</pre>
						</Linkify>
					) : (
						<small>
							Message Deleted
							{message.deleted_by && sessionData?.role !== '1' ? ` by ${channelUsers[message.deleted_by]?.displayname}` : ''}
						</small>
					)}

				</div>
				{
					!!message.attachments.length && (
						message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit
					) && (
						<div className={styles.replyAttachments}>
							{
								message.attachments.map((attachment: any) => {
									if (attachment.mimetype.includes('image/')) {
										return (
											<Image
												width={200}
												key={attachment.url}
												src={attachment.url}
												alt={attachment.url}
												preview={!isSidebarEmbed}
												onClick={() => {
													if (isSidebarEmbed) {
														window.open(attachment.url, '_blank')?.focus();
													}
												}}
												style={isSidebarEmbed ? { cursor: 'pointer' } : {}}
											/>
										);
									}
									return (
										<FileAttachment
											name={attachment.name}
											link={attachment.url}
											type={attachment.mimetype}
										/>
									);
								})
							}
						</div>
					)
				}
			</div>
		</div>
	);
};
