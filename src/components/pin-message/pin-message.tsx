import React, {
	useState, useMemo, useEffect, useCallback,
} from 'react';
import {
	PushpinFilled, ManOutlined,
} from '@ant-design/icons';
import {
	Badge, Popover, Popconfirm, Tooltip, message as alertMessage, Image,
} from 'antd';
import Linkify from 'react-linkify';
import { UserAvatar } from '../avatar';
import { getMessageTimeString } from '../../libs/utils';
import { MessageEventKind, UserRoles } from '../../config';
import styles from './pin-message.module.css';
import { UserDetailsCard } from '../user-details-card';
import { FileAttachment } from '../file-attachment';

export interface PinMessageProps {
	message: any | null
	sessionData: any | null
	isSidebarEmbed?: boolean
	channelUsers?: any | null
	channelId: string
	workspaceId: string

	unPinMessage: (
		messageId: string,
	) => Promise<void>
	goToMessage: (
		wId: string, cId: string, mId: string
	) => void
}

export const PinMessage: React.FunctionComponent<PinMessageProps> = (props) => {
	const {
		sessionData,
		isSidebarEmbed, message, workspaceId, channelId, channelUsers, unPinMessage, goToMessage,
	} = props;
	const [tokenMessage, setTokenMessage] = useState<[]>([]);

	const handleUnpinMessage = useCallback(
		async () => {
			await unPinMessage(message.id);
			alertMessage.success('Message unpinned');
		}, [unPinMessage, message],
	);
	useEffect(() => {
		const arr = [] as any;
		let currentIndex = 0;
		let messageContent: string;
		if (message.content.length > 120) {
			messageContent = message.content.slice(0, 120);
			messageContent += ' ...';
		} else {
			messageContent = message.content;
		}
		message.mentions.map((val: any) => {
			const len = val.display.length;
			const startIndex = val.plainTextIndex;
			arr.push(messageContent.substring(currentIndex, startIndex));
			arr.push(messageContent.substring(startIndex, startIndex + len));
			currentIndex = startIndex + len;
			return len;
		});
		if (currentIndex < messageContent.length) {
			arr.push(messageContent.substring(currentIndex));
		}
		setTokenMessage(arr);
		console.log('tokeen message', arr);
	}, [message.mentions, message.content]);

	return (
		<div style={{ paddingLeft: isSidebarEmbed ? '5px' : '' }}>
			<div className={styles.messageWrapper}>
				<div className={styles.avatarContainer}>
					<UserAvatar
						id={message?.created_by?._id ?? ''}
						src={sessionData?.userId === message.created_by?._id ? sessionData?.profilePic : ''}
						displayName={message?.created_by?.displayname ?? 'A'}
						size={isSidebarEmbed ? 30 : 35}
					/>
				</div>
				<div className={styles.message}>
					<div className={`${styles.messageDetails} selectable`}>
						{message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit
							? (<span>{getMessageTimeString(+message.created_at)}</span>)
							: (<span>{getMessageTimeString(+message.deleted_at)}</span>)}

						{message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit ? (
							<div className={styles.messageActionContainer}>

								{(message.is_resolved && sessionData?.role !== '1') ? (
									<Badge
										className="site-badge-count-109"
										count="Resolved"
										style={{ backgroundColor: '#85BC87' }}
									/>
								) : ''}
								{(message.is_discussion_required && sessionData?.role !== '1') ? (
									<Badge
										className="site-badge-count-109"
										count="To discuss"
										style={{ backgroundColor: '#FDA373' }}
									/>
								) : ''}
							</div>
						) : ''}

						{sessionData.role !== '1' ? (
							<Popconfirm
								title="Unpin this message"
								onConfirm={handleUnpinMessage}
								getPopupContainer={(trigger) => trigger.parentElement || document.body}
							>
								<Tooltip title="Unpin this message">
									<PushpinFilled />
								</Tooltip>
							</Popconfirm>
						) : ''}
						<Tooltip title="Go to this message">
							<ManOutlined
								style={{ marginLeft: '10px' }}
								onClick={() => goToMessage(
									workspaceId, channelId, message.id,
								)}
							/>
						</Tooltip>

					</div>
					<div className={`${styles.messageContent} selectable`}>
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
						{message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit ? (
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
												const foundIndex = message?.mentions?.findIndex(
													(e: any) => e.display === el,
												);
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
							<div className={styles.messageAttachments}>
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
		</div>
	);
};
