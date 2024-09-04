import React, {
	useCallback, useEffect, useState, useMemo, useRef,
} from 'react';
import {
	DeleteOutlined, EditOutlined, CheckOutlined, MessageOutlined, CopyOutlined, CloseOutlined,
	SendOutlined, BellFilled, BellOutlined, LoadingOutlined, NotificationOutlined, UserSwitchOutlined,
	LinkOutlined, LikeOutlined, PushpinOutlined, PushpinFilled, MessageFilled,
} from '@ant-design/icons';
import {
	Button, Popover, Popconfirm, Image, Badge, Tooltip, message as alertMessage, Spin, Select,
} from 'antd';
import Linkify from 'react-linkify';

import { MentionItem } from 'react-mentions';
import { useHistory } from 'react-router';
import styles from './message.module.css';
import { UserAvatar } from '../avatar';
import { MessageEditor } from '../message-editor';
import { Reply } from '../reply';
import { getMessageTimeString } from '../../libs/utils';
import { UserDetailsCard } from '../user-details-card';
import {
	UserRoles, MessageEventKind, channelWritePermissionType, ChannelKind,
} from '../../config';
import { MessageAction } from '../message-action';
import { FileAttachment } from '../file-attachment';
import fileIcon from '../../assets/img/file.svg';

interface MessageProps {
	repliesVisible?: boolean
	isSidebarEmbed?: boolean
	sessionData: any | null
	message: any | null
	currentChannelPermission: any | null
	currentChannelType: any | null
	currentChannelPinnedMessageId?: string
	currentChannelLikedMessageIds: any | null
	channelUsers?: any | null
	messageEditId?: string | undefined
	messageReplyId?: string | undefined
	activeChannelId?: string | undefined
	createReply: (
		content: string, mentions: MentionItem[], attachments: any[], messageId: string
	) => Promise<void>

	deleteMessage: (
		messageId: string
	) => Promise<void>

	verifyMessage: (
		messageId: string,
		isResolved: boolean,
	) => Promise<void>

	discussionRequiredToggle: (
		messageId: string,
		isDiscussionRequired: boolean,
	) => Promise<void>

	notificationMessageToggle: (
		messageId: string,
		isNotification: boolean
	) => Promise<void>

	likeMessage: (
		messageId: string,
		isLiked: boolean,
	) => Promise<void>

	unLikeMessage: (
		messageId: string,
		isUnliked: boolean,
	) => Promise<void>

	pinMessage: (
		messageId: string,
	) => Promise<void>

	unPinMessage: (
		messageId: string,
	) => Promise<void>

	deleteReply: (
		replyId: string,
		messageId: string
	) => Promise<void>

	handleDMUser?: (userId: string) => Promise<void>

	getReplies: (messageId: string) => Promise<void>
	uploadAttachment: (data: unknown) => Promise<string>
	setRepliesVisible: (messageId?: string) => void
	setMessageEditId: (messageId: string) => void
	setMessageReplyId: (messageId: string) => void

	handleEditReply?: (content: string, mentions: MentionItem[], attachments: any[],
		replytoparentid: string) => Promise<void>

	copyMessageLink: (mId: string) => Promise<void>
	getUsersListByNamePrefix: (payload: any) => Promise<void>
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>((props, forwardedRef) => {
	const history = useHistory();

	const {
		repliesVisible,
		isSidebarEmbed,
		sessionData,
		message,
		currentChannelPermission,
		currentChannelPinnedMessageId,
		currentChannelType,
		currentChannelLikedMessageIds,
		channelUsers,
		createReply,
		deleteMessage,
		verifyMessage,
		discussionRequiredToggle,
		notificationMessageToggle,
		likeMessage,
		unLikeMessage,
		pinMessage,
		unPinMessage,
		handleDMUser,
		deleteReply,
		getReplies,
		uploadAttachment,
		setRepliesVisible,
		messageEditId,
		setMessageEditId,
		handleEditReply,
		setMessageReplyId,
		messageReplyId,
		copyMessageLink,
		getUsersListByNamePrefix,
		activeChannelId,
	} = props;

	const repliesContainerRef = useRef<HTMLDivElement>(null);

	const [deleteLoader, setDeleteLoader] = useState(false);
	const [deleteVisible, setdeleteVisible] = useState(false);
	const [verifyVisible, setverifyVisible] = useState(false);
	const [verifyLoader, setverifyLoader] = useState(false);
	const [discussionVisible, setdiscussionVisible] = useState(false);
	const [discussionLoader, setdiscussionLoader] = useState(false);
	const [notificationVisible, setNotificationVisible] = useState(false);
	const [notificationChangeLoader, setNotificationChangeLoader] = useState(false);

	// const [mentorsNotifyVisible, setMentorsNotifyVisible] = useState(false);
	// const [mentorsNotifyLoader, setMentorsNotifyLoader] = useState(false);
	const [likeMessageLoading, setLikeMessageLoading] = useState(false);

	const [tokenMessage, setTokenMessage] = useState<[]>([]);
	// const showPopconfirmDelete = () => {
	// 	setdeleteVisible(true);
	// };
	// const showPopconfirmVisibleToggle = () => {
	// 	setverifyVisible(true);
	// };

	// const showPopconfirmDiscussionVisible = () => {
	//	setdiscussionVisible(true);
	// };

	const toggleRepliesVisible = useCallback(() => {
		setMessageReplyId('');
		if (repliesVisible) {
			setRepliesVisible();
		} else {
			setRepliesVisible(message.id);
		}
	}, [message, repliesVisible, setRepliesVisible, setMessageReplyId]);

	useEffect(() => {
		(async () => {
			if (repliesVisible) {
				await getReplies?.(message.id);

				repliesContainerRef?.current?.scrollIntoView({
					behavior: 'auto',
					block: 'nearest',
				});
			}
		})();
	}, [repliesVisible, message.id, getReplies]);

	const handleCreateReply = useCallback(
		async (content: string, mentions: MentionItem[], attachments: any[]) => {
			await createReply(content, mentions, attachments, message.id);
		}, [message, createReply],
	);

	const handleDeleteMessage = useCallback(
		async () => {
			try {
				setDeleteLoader(true);
				await deleteMessage(message.id);
				setDeleteLoader(false);
				alertMessage.success('Message deleted');
			} catch (error) {
				setDeleteLoader(false);
				console.error(error);
				alertMessage.error('Message delete failed');
			}
		}, [message, deleteMessage],
	);

	const handleToggleVerifyMessage = useCallback(
		async () => {
			setverifyLoader(true);
			await verifyMessage(message.id, !message.is_resolved);
			setverifyLoader(false);
			setverifyVisible(false);
		}, [message, verifyMessage],
	);

	const handleToggleDiscussionMessage = useCallback(
		async () => {
			setdiscussionLoader(true);
			await discussionRequiredToggle(message.id, !message.is_discussion_required);
			setdiscussionLoader(false);
			setdiscussionVisible(false);
		}, [message, discussionRequiredToggle],
	);

	const handleTogglePinMessage = useCallback(
		async () => {
			if (message.id === currentChannelPinnedMessageId) {
				await unPinMessage(message.id);
				alertMessage.success('Message unpinned');
			} else {
				await pinMessage(message.id);
				alertMessage.success('Message pinned');
			}
		}, [message, pinMessage, unPinMessage, currentChannelPinnedMessageId],
	);

	const handleToggleNotificationMessage = useCallback(
		async () => {
			setNotificationChangeLoader(true);
			let userIds = [];
			if (typeof message?.notify_user_ids === 'string') {
				userIds = JSON.parse(message?.notify_user_ids);
			} else {
				userIds = message?.notify_user_ids;
			}
			if (userIds?.includes(sessionData?.userId)) {
				await notificationMessageToggle(message.id, false);
			} else {
				await notificationMessageToggle(message.id, true);
			}
			setNotificationChangeLoader(false);
			setNotificationVisible(false);
		}, [message, notificationMessageToggle, sessionData],
	);

	const handelEditMessage = (messageId: string) => {
		setMessageEditId(messageId);
	};

	const handleLikeMessage = useCallback(
		async (id: string, isLiked: boolean) => {
			if (likeMessageLoading) {
				return;
			}
			setLikeMessageLoading(true);
			await likeMessage(id, !isLiked);
			// TODO: need to alternate solution for this
			setTimeout(() => setLikeMessageLoading(false), 700);
		}, [likeMessage, likeMessageLoading],
	);

	const handleUnLikeMessage = useCallback(
		async (id: string, isUnliked: boolean) => {
			await unLikeMessage(id, !isUnliked);
		}, [unLikeMessage],
	);

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

	const mentionUsers = useMemo(() => {
		const users = {
			...channelUsers,
		};

		if (sessionData?.userId) {
			delete users[sessionData.userId];
		}

		return users;
	}, [channelUsers, sessionData]);

	return (
		<div className={styles.messageWrapper} ref={forwardedRef}>
			<div className={styles.avatarContainer}>
				{channelUsers[message.created_by?._id]?.online ? (
					<div className={styles.onlineUserIcon} />
				) : ''}
				<UserAvatar
					id={message.created_by?._id ?? ''}
					src={sessionData?.userId === message.created_by?._id ? sessionData?.profilePic : ''}
					displayName={message.created_by?.displayname ?? ''}
					size={isSidebarEmbed ? 35 : 45}
				/>
			</div>
			<div className={styles.message}>
				<div className={`${styles.messageDetails} selectable`}>
					{message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit
						? (<span>{getMessageTimeString(+message.created_at)}</span>)
						: (<span>{getMessageTimeString(+message.deleted_at)}</span>)}

					{message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit ? (
						<div className={styles.messageActionContainer}>

							{/* like button */}
							{/* <Badge className={styles.likeBadge} count={message.liked_by?.length} size="small">
								<Tooltip title="Like message">
									<Button
										onClick={() => handleLikeMessage(message.id,
											message.liked_by?.includes(sessionData.userId))}
										className={styles.likeButton}
									>
										<Avatar
											style={{
												backgroundColor: `${
													message.liked_by?.includes(sessionData?.userId)
														? '#40a9ff' : ''
												}`,
											}}
											shape="circle"
											size="small"
											icon={<LikeOutlined />}
										/>
									</Button>
								</Tooltip>
							</Badge> */}
							{/* like button */}

							{/* dislike button */}
							{/* <Badge
								className={styles.likeBadge}
								count={message.unliked_by?.length}
								size="small"
							>
								<Tooltip title="Unlike message">
									<Button
										onClick={() => handleUnLikeMessage(message.id,
											message.unliked_by?.includes(sessionData?.userId))}
										className={styles.likeButton}
									>
										<Avatar
											style={{
												backgroundColor: `${
													message.unliked_by?.includes(sessionData.userId)
														? '#40a9ff' : ''
												}`,
											}}
											shape="circle"
											size="small"
											icon={<DislikeOutlined />}
										/>
									</Button>
								</Tooltip>
							</Badge> */}
							{/* dislike button */}

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
							{sessionData?.userId === message.created_by?._id || (sessionData?.role !== '1' && message.created_by?.role === '1') ? (
								<Popconfirm
									title="Are you sure you want to delete this message?"
									// visible={deleteVisible}
									onConfirm={handleDeleteMessage}
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
									<EditOutlined onClick={() => handelEditMessage(message.id)} />
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
							{
								currentChannelType !== ChannelKind.Private
								&& message?.created_by?._id !== sessionData.userId
									? (
										<>
											{message?.notify_user_ids?.includes(sessionData?.userId) ? (
												<Popconfirm
													title={message?.notify_user_ids?.includes(sessionData?.userId)
														? 'Stop notification' : 'Start notification'}
													onConfirm={handleToggleNotificationMessage}
													okButtonProps={{ loading: notificationChangeLoader }}
													onCancel={() => setNotificationVisible(false)}
													getPopupContainer={(trigger) => trigger.parentElement || document.body}
												>
													<Tooltip
														title={message?.notify_user_ids?.includes(sessionData?.userId)
															? 'Stop notification' : 'Start notification'}
														getPopupContainer={
															(trigger) => trigger.parentElement || document.body
														}
													>
														{
															message?.notify_user_ids?.includes(sessionData?.userId)
																? (<BellFilled />)
																: (<BellOutlined />)
														}
													</Tooltip>
												</Popconfirm>
											) : ''}
										</>
									) : null
							}
							{message.id === currentChannelPinnedMessageId
							&& currentChannelType !== ChannelKind.Private
							&& sessionData?.role !== '1'
								? (
									<Popconfirm
										title="Unpin this message"
										onConfirm={handleTogglePinMessage}
										getPopupContainer={(trigger) => trigger.parentElement || document.body}
									>
										<Tooltip
											title="Unpin this message"
											getPopupContainer={
												(trigger) => trigger.parentElement || document.body
											}
										>
											{message.id === currentChannelPinnedMessageId
												? (<PushpinFilled />) : (<PushpinOutlined />)}
										</Tooltip>
									</Popconfirm>
								) : ''}

							<MessageAction
								message={message}
								sessionData={sessionData}
								isPinedMessage={message.id === currentChannelPinnedMessageId}
								visibleNotMessageOwner={currentChannelType !== ChannelKind.Private
									&& message?.created_by?._id !== sessionData.userId}
								copyMessageLink={copyMessageLink}
								handleToggleNotificationMessage={handleToggleNotificationMessage}
								visibleOnlyAdmin={currentChannelType !== ChannelKind.Private && sessionData?.role !== '1'}
								handleToggleVerifyMessage={handleToggleVerifyMessage}
								handleToggleDiscussionMessage={handleToggleDiscussionMessage}
								handleTogglePinMessage={handleTogglePinMessage}
							/>

							{
								currentChannelType !== ChannelKind.Private
									&& message?.created_by?._id !== sessionData.userId
									? (
										<>
											{/* <Tooltip
												title="Copy Message Link"
												getPopupContainer={
													(trigger) => trigger.parentElement || document.body
												}
											>
												<LinkOutlined onClick={() => copyMessageLink(message.id)} />
											</Tooltip> */}
											{/* <Popconfirm
												title={message?.notify_user_ids?.includes(sessionData?.userId)
													? 'Stop notification' : 'Start notification'}
												// visible={notificationVisible}
												onConfirm={handleToggleNotificationMessage}
												okButtonProps={{ loading: notificationChangeLoader }}
												onCancel={() => setNotificationVisible(false)}
												getPopupContainer={(trigger) => trigger.parentElement || document.body}
											>
												<Tooltip
													title={message?.notify_user_ids?.includes(sessionData?.userId)
														? 'Stop notification' : 'Start notification'}
													getPopupContainer={
														(trigger) => trigger.parentElement || document.body
													}
												>
													{
														message?.notify_user_ids?.includes(sessionData?.userId)
															? (<BellFilled />)
															: (<BellOutlined />)
													}

												</Tooltip>
											</Popconfirm> */}
										</>
									) : ''
							}

							{
								currentChannelType !== ChannelKind.Private && sessionData?.role !== '1' && (
									<>
										{/* <Popconfirm
											title={message.is_resolved
												? 'Are you sure you want to unresolve this message?'
												: 'Are you sure you want to resolve this message?'}
											// visible={verifyVisible}
											onConfirm={handleToggleVerifyMessage}
											okButtonProps={{ loading: verifyLoader }}
											onCancel={() => setverifyVisible(false)}
											getPopupContainer={(trigger) => trigger.parentElement || document.body}
										>
											{message.is_resolved ? (
												<Tooltip
													title="Un-resolve"
													getPopupContainer={
														(trigger) => trigger.parentElement || document.body
													}
												>
													<CloseOutlined />
												</Tooltip>
											) : (
												<Tooltip
													title="Resolve"
													getPopupContainer={
														(trigger) => trigger.parentElement || document.body
													}
												>
													<CheckOutlined />
												</Tooltip>
											)}

										</Popconfirm> */}

										{/* <Popconfirm
											title={message.is_discussion_required
												? 'Are you sure you want to remove discussion required from this message?'
												: 'Are you sure you want to add discussion required to this message?'}
											// visible={discussionVisible}
											onConfirm={handleToggleDiscussionMessage}
											okButtonProps={{ loading: discussionLoader }}
											// onCancel={() => setdiscussionVisible(false)}
											getPopupContainer={(trigger) => trigger.parentElement || document.body}
										>
											{message.is_discussion_required ? (
												<Tooltip
													title="Discussion not required"
													getPopupContainer={
														(trigger) => trigger.parentElement || document.body
													}
												>
													<MessageFilled />
												</Tooltip>
											) : (
												<Tooltip
													title="Discussion required"
													getPopupContainer={
														(trigger) => trigger.parentElement || document.body
													}
												>
													<MessageOutlined />
												</Tooltip>
											)}

										</Popconfirm> */}

										{/* <Popconfirm
											title="Pin this message"
											onConfirm={handleSetPinMessage}
											getPopupContainer={(trigger) => trigger.parentElement || document.body}
										>
											<Tooltip
												title="Pin this message"
												getPopupContainer={
													(trigger) => trigger.parentElement || document.body
												}
											>
												{message.id === currentChannelPinnedMessageId
													? (<PushpinFilled />) : (<PushpinOutlined />)}

											</Tooltip>
										</Popconfirm> */}

										{/* {
											handleDMUser && !isSidebarEmbed
												&& currentChannelType !== ChannelKind.Private
												&& message.created_by?._id !== sessionData?.userId
												? (
													<Popconfirm
														title="DM this user?"
														onConfirm={() => handleDMUser(message.created_by._id)}
														getPopupContainer={(trigger) => trigger.parentElement || document.body}
													>
														<Tooltip
															title="DM user"
															getPopupContainer={
																(trigger) => trigger.parentElement || document.body
															}
														>
															<SendOutlined />
														</Tooltip>
													</Popconfirm>
												) : null
										} */}
									</>
								)
							}
						</div>
					) : ''}

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
								showDm={currentChannelType !== ChannelKind.Private
									&& sessionData?.role !== '1'
									&& handleDMUser && !isSidebarEmbed
									&& currentChannelType !== ChannelKind.Private
									&& message.created_by?._id !== sessionData?.userId}
								handleDMUser={handleDMUser}
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
				{
					(message.status === MessageEventKind.Add
						|| message.status === MessageEventKind.Edit)
					&& (currentChannelType !== ChannelKind.Private) && (
						<div
							className={styles.usefullContainer}
						>
							<Button
								onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
								className="likeBtnn"
								onClick={() => handleLikeMessage(message?.id,
									currentChannelLikedMessageIds?.includes(message?.id))}
								style={{
									color: `${currentChannelLikedMessageIds?.includes(message?.id)
										? '#DE6834' : ''
									}`,
								}}
							>
								{message?.likedByCount ? (
									<>
										<LikeOutlined />
										{message?.likedByCount}
									</>
								) : <LikeOutlined />}
							</Button>

						</div>
					)
				}

				{
					(message.status === MessageEventKind.Add || message.status === MessageEventKind.Edit) && ((currentChannelPermission === channelWritePermissionType.everyone || sessionData?.role !== '1' || message.replyids?.length || message.replyCount)) ? (
						<div className={styles.messageActions}>
							<Button
								type="link"
								onClick={toggleRepliesVisible}
							>
								{
									(() => {
										if (repliesVisible) {
											return 'Hide';
										} if ((message.replyCount ?? 0) + (message.replyids?.length ?? 0)) {
											return `Replies (${(message.replyCount ?? 0) + (message.replyids?.length ?? 0)})`;
										}

										return 'Reply';
									})()
								}
							</Button>
						</div>
					) : ''
				}
				{
					repliesVisible && (message.status === MessageEventKind.Add
						|| message.status === MessageEventKind.Edit) ? (
							<div className={styles.repliesContainer} ref={repliesContainerRef}>
								{message?.repliesLoader ? (
									<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
								) : (
									<div className={styles.repliesList}>
										{
											message.replies?.map((reply: any) => (
												<Reply
													key={reply.id}
													sessionData={sessionData}
													message={reply}
													messageParent={message}
													deleteReply={deleteReply}
													setMessageReplyId={setMessageReplyId}
													messageReplyId={messageReplyId}
													channelUsers={channelUsers}
													currentChannelPermission={currentChannelPermission}
													isSidebarEmbed={isSidebarEmbed}
												/>
											))
										}
									</div>
								)}

								{(currentChannelPermission === channelWritePermissionType.everyone || sessionData?.role !== '1') ? (
									<div className={styles.replyEditorContainer}>
										<MessageEditor
											isSidebarEmbed={isSidebarEmbed}
											isReplyInput
											users={
												currentChannelType !== ChannelKind.Private ? mentionUsers : []
											}
											sessionData={sessionData}
											uploadAttachment={uploadAttachment}
											createMessage={handleCreateReply}
											messageEditId={messageEditId}
											setMessageEditId={setMessageEditId}
											editMessageObj=""
											editMessage={async (
												content: string, mentions: MentionItem[], attachments: any[],
											) => {
											// only in case of reply, no use of this
											// we have to delete this
											}}
											setMessageReplyId={setMessageReplyId}
											messageReplyId={messageReplyId}
											editReplyObj={message.replies?.find((msg: any) => msg.id === messageReplyId)}
											handleEditReply={handleEditReply}
											channelUsers={channelUsers}
											getUsersListByNamePrefix={getUsersListByNamePrefix}
											activeChannelId={activeChannelId}
											activeChannelType={currentChannelType}
										/>
									</div>
								) : (
									<div className={styles.replyEditorContainer}>
										<MessageEditor
											isSidebarEmbed={isSidebarEmbed}
											isReplyInput
											users={
												currentChannelType !== ChannelKind.Private ? mentionUsers : []
											}
											sessionData={sessionData}
											uploadAttachment={uploadAttachment}
											createMessage={handleCreateReply}
											messageEditId={messageEditId}
											setMessageEditId={setMessageEditId}
											editMessageObj=""
											editMessage={async (
												content: string, mentions: MentionItem[], attachments: any[],
											) => {
											// only in case of reply, no use of this
											// we have to delete this
											}}
											setMessageReplyId={setMessageReplyId}
											messageReplyId={messageReplyId}
											editReplyObj={message.replies?.find((msg: any) => msg.id === messageReplyId)}
											handleEditReply={handleEditReply}
											channelUsers={channelUsers}
											isDisabled
											getUsersListByNamePrefix={getUsersListByNamePrefix}
											activeChannelId={activeChannelId}
											activeChannelType={currentChannelType}
										/>
									</div>
								)}

							</div>
						) : ''
				}
			</div>
		</div>
	);
});
