import React, {
	useCallback,
	useEffect, useMemo, useRef, useState,
} from 'react';
import {
	Divider, Progress, message as alertMessage, Button, Tooltip, Tabs, Badge, Spin, Checkbox, Empty,
	Dropdown, Menu, Space, Modal, message,
} from 'antd';
import { generatePath, useHistory } from 'react-router';
import { MentionItem } from 'react-mentions';
import {
	DoubleRightOutlined, LinkOutlined, LoadingOutlined, FilterOutlined,
	SettingOutlined,
	FilterFilled,
} from '@ant-design/icons';
import { Users } from 'react-feather';
import { Message } from '../../../components/message';
import { AppState, useAppStore } from '../../../stores';

import styles from './workspaces-main.module.css';
import { Sidebar } from '../../../components/sidebar';
import { MessageEditor } from '../../../components/message-editor';
import { getMessageTimeString, logger, mergeRefs } from '../../../libs/utils';
import {
	UserRoles, channelWritePermissionType, ChannelKind,
	APP_CONFIG, UserActivityKind, MsgNodeType, MessageEventKind,
} from '../../../config';
import { PinMessage } from '../../../components/pin-message';

import { ReactComponent as Loader } from '../../../assets/icons/loader.svg';
import { ReactComponent as IntroGroupChat } from '../../../assets/img/GroupChat.svg';
import { ReactComponent as DirectMessages } from '../../../assets/img/DirectMessages.svg';
import { ReactComponent as OnlineWorld } from '../../../assets/img/OnlineWorld.svg';
import participantsImg from '../../../assets/icons/Participants.svg';
import { Topbar } from '../../../components/topbar';
import usePagination from '../../../hooks/use-pagination';
import { ProfileDropdownButton } from '../../../components/profile';
import { ProfileModal } from '../../../components/profile-modal';

const appStoreSelector = (state: AppState) => ({
	disabled: state.disabled,
	channelsLoading: state.channelsLoading,
	messagesLoading: state.messagesLoading,
	connected: state.connected,
	sessionData: state.sessionData,
	currentWorkspace: state.currentWorkspace,
	workspaces: state.workspaces,
	channels: state.channels,
	dms: state.dms,
	currentChannel: state.currentChannel,
	likedMessageIds: state.likedMessageIds,
	messages: state.messages,
	userActivity: state.userActivity,
	channelUsersData: state.channelUsersData,
	activeWorkspaceId: state.activeWorkspaceId,
	activeChannelId: state.activeChannelId,

	getWorkspaces: state.getWorkspaces,
	setCurrentWorkspace: state.setCurrentWorkspace,

	createChannel: state.createChannel,
	updateChannelName: state.updateChannelName,
	updateChannelPermission: state.updateChannelPermission,
	getChannels: state.getChannels,
	addUserInChannel: state.addUserInChannel,
	addBatchInChannel: state.addBatchInChannel,
	setCurrentChannel: state.setCurrentChannel,
	updateChannelLastSeen: state.updateChannelLastSeen,

	getMessages: state.getMessages,
	getPrevMessages: state.getPrevMessages,
	getNextMessages: state.getNextMessages,
	getReplies: state.getReplies,
	createMessage: state.createMessage,
	editMessage: state.editMessage,
	editReply: state.editReply,
	createReply: state.createReply,
	deleteMessage: state.deleteMessage,
	verifyMessage: state.verifyMessage,
	discussionRequiredToggle: state.discussionRequiredToggle,
	notificationMessageToggle: state.notificationMessageToggle,
	likeMessage: state.likeMessage,
	unLikeMessage: state.unLikeMessage,
	pinMessage: state.pinMessage,
	unPinMessage: state.unPinMessage,
	deleteReply: state.deleteReply,
	uploadAttachment: state.uploadAttachment,
	getUserActivity: state.getUserActivity,
	getUsersListByNamePrefix: state.getUsersListByNamePrefix,
	getChannelUsersList: state.getChannelUsersList,
	getBatchUserIds: state.getBatchUserIds,
	createWorkspace: state.createWorkspace,
	leaveChannel: state.leaveChannel,
	logout: state.logout,
	setProfile: state.setProfile,
	getProfileUploadUrl: state.getProfileUploadUrl,
});

interface WorkspacesMainProps {
	courseId?: string
	workspaceId?: string
	channelId?: string
	messageId?: string
	isEmbed?: boolean
	isSidebarEmbed?: boolean
}

export const WorkspacesMain: React.FunctionComponent<WorkspacesMainProps> = (props) => {
	const history = useHistory();

	const {
		courseId, workspaceId, channelId, messageId, isEmbed, isSidebarEmbed,
	} = props;

	const {
		disabled,
		channelsLoading,
		messagesLoading,
		connected,
		sessionData,
		currentWorkspace,
		currentChannel,
		likedMessageIds,
		workspaces,
		channels,
		dms,
		messages,
		userActivity,
		channelUsersData,
		activeWorkspaceId,
		activeChannelId,
		// resetPagination,
		getWorkspaces,
		setCurrentWorkspace,
		createChannel,
		updateChannelName,
		updateChannelPermission,
		getChannels,
		setCurrentChannel,
		updateChannelLastSeen,
		getMessages,
		getPrevMessages,
		getNextMessages,
		getReplies,
		createMessage,
		editMessage,
		editReply,
		createReply,
		deleteMessage,
		verifyMessage,
		discussionRequiredToggle,
		notificationMessageToggle,
		likeMessage,
		unLikeMessage,
		pinMessage,
		unPinMessage,
		deleteReply,
		addUserInChannel,
		addBatchInChannel,
		uploadAttachment,
		getUserActivity,
		getUsersListByNamePrefix,
		getChannelUsersList,
		getBatchUserIds,
		createWorkspace,
		leaveChannel,
		logout,
		setProfile,
		getProfileUploadUrl,
	} = useAppStore(appStoreSelector);

	const initialDataLoadedRef = useRef<boolean>(false);

	const courseIdRef = useRef<string | undefined>(courseId);
	const workspaceIdRef = useRef<string | undefined>(workspaceId);
	const channelIdRef = useRef<string | undefined>(channelId);
	const messageIdRef = useRef<string | undefined>(messageId);
	const isUnreadDividerMsgIdRef = useRef<string | undefined>('');
	const currentDayRef = useRef<number>(0);

	const [appLoadProgress, setAppLoadProgress] = useState<number>(0);
	const [loadProgressText, setLoadProgressText] = useState<string>('Initializing connection and getting data...');
	const [isActivityLoading, setIsActivityLoading] = useState<boolean>(false);
	const [pinMsgObj, setPinMsgObj] = useState<any>(null);
	const [repliesVisibleOf, setRepliesVisibleOf] = useState<string>();
	const [messageEditId, setMessageEditId] = useState<string | undefined>(undefined);
	const [messageReplyId, setMessageReplyId] = useState<string | undefined>(undefined);
	const [unresolvedOnly, setUnresolvedOnly] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>('discussion');
	const [usersSidebarVisible, setUserSidebarVisible] = useState<boolean>(false);
	const [isChannelPermissionModalVisible, setIsChannelPermissionModalVisible] = useState(false);
	const [isEmojiPickerModalVisible, setIsEmojiPickerModalVisible] = useState(false);
	const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);

	const embedSearchParam = useMemo(() => {
		if (isEmbed) {
			return '?isEmbed';
		} if (isSidebarEmbed) {
			return '?isSidebarEmbed';
		}

		return '';
	}, [isEmbed, isSidebarEmbed]);

	const {
		scrollToDataNodeId: scrollToMsgId,
		goToBottomVisible,
		setGoToBottomVisible,
		prevDataLoading: prevMessagesLoading,
		nextDataLoading: nextMessagesLoading,
		dataListContainerRef: msgListContainerRef,
		firstDataNodeContainerRef: firstMsgContainerRef,
		lastDataNodeContainerRef: lastMsgContainerRef,
		currentDataNodeContainerRef: currentMsgContainerRef,
		resetPagination: resetMessagesPagination,
		setScrollToDataNodeId: setScrollToMsgId,
		setUpScrollAllowed,
		// setScrollToEnd: setScrollToMsgListEnd,
	} = usePagination(getPrevMessages, getNextMessages);

	const getPrevUserActivity = useCallback(
		async (limit: number) => getUserActivity(limit, true), [getUserActivity],
	);

	const {
		prevDataLoading: prevUserActivityLoading,
		dataListContainerRef: userActivityListContainerRef,
		firstDataNodeContainerRef: firstUserActivityContainerRef,
		resetPagination: resetUserActivityPagination,
		setScrollToEnd: setScrollToUserActivityListEnd,
	} = usePagination(getPrevUserActivity);

	useEffect(() => {
		(async () => {
			try {
				initialDataLoadedRef.current = false;

				if (sessionData?.userId) {
					const mId = await getWorkspaces(
						true, courseIdRef.current, workspaceIdRef.current,
						channelIdRef.current, messageIdRef.current,
					);

					setScrollToMsgId(mId);
				}

				initialDataLoadedRef.current = true;
				setAppLoadProgress(96);
			} catch (e: any) {
				history.replace({
					pathname: '/error',
					search: embedSearchParam,
				});
			}
		})();
	}, [history, embedSearchParam, sessionData?.userId, setScrollToMsgId, getWorkspaces]);

	useEffect(() => {
		if (disabled) {
			history.replace({
				pathname: '/error/disabled',
				search: embedSearchParam,
			});
		}
	}, [history, embedSearchParam, disabled]);

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;
		if (connected && initialDataLoadedRef.current) {
			if (appLoadProgress < 100) {
				intervalId = setInterval(() => {
					setAppLoadProgress(appLoadProgress + 1);
				}, 20);
			}
		} else if (appLoadProgress < 95) {
			intervalId = setInterval(() => {
				setAppLoadProgress(appLoadProgress + 1);
			}, 30);
		} else if (appLoadProgress === 95) {
			setLoadProgressText('It is taking a bit longer than expected, Please wait a moment...');
		}

		return () => clearInterval(intervalId as NodeJS.Timeout);
	}, [connected, appLoadProgress]);

	useEffect(() => {
		if (activeWorkspaceId) {
			history.replace({
				pathname: `/workspace/${activeWorkspaceId}`,
				search: embedSearchParam,
			});

			if (workspaceIdRef.current !== activeWorkspaceId) {
				workspaceIdRef.current = activeWorkspaceId;
			}
		}
	}, [
		history, embedSearchParam, activeWorkspaceId,
	]);

	useEffect(() => {
		if (activeWorkspaceId && activeChannelId) {
			history.replace({
				pathname: generatePath('/workspace/:workspaceId/channel/:channelId', {
					workspaceId: activeWorkspaceId,
					channelId: activeChannelId,
				}),
				search: embedSearchParam,
			});

			if (channelIdRef.current !== activeChannelId) {
				channelIdRef.current = activeChannelId;
			}
		}
	}, [
		history, embedSearchParam, activeWorkspaceId, activeChannelId,
	]);

	useEffect(() => {
		if (currentChannel?.pinnedMsgObj) {
			setPinMsgObj(currentChannel.pinnedMsgObj);
		} else {
			setPinMsgObj(null);
		}
	}, [currentChannel?.pinnedMsgObj]);

	useEffect(() => {
		if (initialDataLoadedRef.current && currentWorkspace?.id) {
			getChannels(currentWorkspace.id, true);
		}
	}, [currentWorkspace?.id, getChannels]);

	useEffect(() => {
		(async () => {
			if (initialDataLoadedRef.current && currentChannel?.id) {
				setActiveTab('discussion');

				let mId = null;
				if (messageIdRef.current) {
					mId = await getMessages(10, messageIdRef.current, true);
				} else {
					mId = await getMessages(10);
				}

				resetMessagesPagination(true, true);
				setScrollToMsgId(mId);
				setUpScrollAllowed(false);
				setGoToBottomVisible(false);
			}
		})();
		setRepliesVisibleOf('');
	}, [currentChannel?.id, setScrollToMsgId, resetMessagesPagination, getMessages,
		setUpScrollAllowed, setGoToBottomVisible]);

	useEffect(() => {
		(async () => {
			if (initialDataLoadedRef.current && messageId !== messageIdRef.current) {
				const mId = await getMessages(10, messageId, true);

				resetMessagesPagination(true, true);
				setScrollToMsgId(mId);
			}
			messageIdRef.current = messageId;
		})();
	}, [messageId, resetMessagesPagination, setScrollToMsgId, getMessages]);

	const goToBottom = useCallback(async () => {
		resetMessagesPagination(true, true);

		if (currentChannel && currentWorkspace) {
			await updateChannelLastSeen(currentChannel.id);

			history.replace({
				pathname: generatePath('/workspace/:workspaceId/channel/:channelId', {
					workspaceId: currentWorkspace.id,
					channelId: currentChannel.id,
				}),
				search: embedSearchParam,
			});

			const mId = await getMessages(10);

			resetMessagesPagination(true, true);
			setScrollToMsgId(mId);
		}
		setRepliesVisibleOf('');
	}, [
		history, embedSearchParam, currentWorkspace, currentChannel,
		updateChannelLastSeen, resetMessagesPagination, getMessages, setScrollToMsgId,
	]);

	const handleChangeUnresolvedOnly = useCallback((e: any) => {
		setUnresolvedOnly(e.target.checked);
	}, []);

	const handleChannelLeave = useCallback(async (channelIdToLeave) => {
		try {
			const toReplace = currentChannel && currentChannel.id === channelIdToLeave;
			await leaveChannel(channelIdToLeave);
			if (toReplace) {
				history.replace('/');
			}
			await getWorkspaces();
			message.success('Channel Leaved!');
			return true;
		} catch (error: any) {
			console.log(error);
			message.error(error?.message ?? error);
			return false;
		}
	}, [currentChannel, leaveChannel, history, getWorkspaces]);

	const handleTabChange = useCallback(async (key: string) => {
		setActiveTab(key);

		if (key === 'my-activity') {
			setIsActivityLoading(true);
			await getUserActivity(20);
			resetUserActivityPagination(true, true);
			setIsActivityLoading(false);
			setScrollToUserActivityListEnd(true);
		}
	}, [getUserActivity, setScrollToUserActivityListEnd, resetUserActivityPagination]);

	const handleChangeWorkspace = useCallback((wId: string) => {
		channelIdRef.current = undefined;
		messageIdRef.current = undefined;

		return setCurrentWorkspace(wId);
	}, [setCurrentWorkspace]);

	const handleChangeChannel = useCallback((cId: string) => {
		messageIdRef.current = undefined;
		setMessageEditId('');
		setMessageReplyId('');
		return setCurrentChannel(cId);
	}, [setCurrentChannel]);

	const handleCreateMessage = useCallback(async (
		content: string, mentions: MentionItem[], attachments: any[],
	) => {
		const isSent = await createMessage(content, mentions, attachments);
		if (isSent) {
			goToBottom();
		}
	}, [createMessage, goToBottom]);

	const handleEditMessage = useCallback(async (
		content: string, mentions: MentionItem[], attachments: any[],
	) => {
		await editMessage(content, mentions, attachments, messageEditId);
		setMessageEditId(undefined);
	}, [editMessage, messageEditId]);

	const handleEditReply = useCallback(async (
		content: string, mentions: MentionItem[], attachments: any[], replytoparentid: string,
	) => {
		await editReply(content, mentions, attachments, messageReplyId, replytoparentid);
		setMessageReplyId(undefined);
	}, [editReply, messageReplyId]);

	const handleDMUser = useCallback(async (userId: string) => {
		const dm = dms?.find((d: any) => d.user_ids.includes(userId));

		if (!dm) {
			await createChannel(Date.now().toString(), ChannelKind.Private, [userId]);
		} else {
			handleChangeChannel(dm?.id);
		}
	}, [dms, handleChangeChannel, createChannel]);

	const copyMessageLink = useCallback(async (mId: string) => {
		try {
			const url = `${window.location.protocol}//${window.location.host}/workspace/${currentWorkspace.id}/channel/${currentChannel.id}/message/${mId}`;
			await navigator.clipboard.writeText(url);

			alertMessage.success('Link copied');
		} catch (error) {
			logger.error(error);

			alertMessage.error('Failed');
		}
	}, [currentWorkspace, currentChannel]);

	const goToMessage = useCallback((wId: string, cId: string, mId: string) => {
		setUnresolvedOnly(false);
		setActiveTab('discussion');

		history.replace({
			pathname: generatePath('/workspace/:workspaceId/channel/:channelId/message/:messageId', {
				workspaceId: wId,
				channelId: cId,
				messageId: mId,
			}),
			search: embedSearchParam,
		});

		if (messageIdRef.current === mId) {
			setScrollToMsgId(mId);
		}
	}, [
		history, embedSearchParam, setScrollToMsgId,
	]);

	const mentionUsers = useMemo(() => {
		const users = {
			...channelUsersData,
		};

		if (sessionData?.userId) {
			delete users[sessionData.userId];
		}

		return users;
	}, [channelUsersData, sessionData]);

	const memoisedMessages = useMemo(() => {
		if (messages?.length) {
			if (unresolvedOnly) {
				return messages.filter(
					(m: any) => !m.is_resolved
						&& !(m.status === MessageEventKind.Delete),
				);
			}
			isUnreadDividerMsgIdRef.current = '';
			return messages;
		}
		return [];
	}, [messages, unresolvedOnly]);

	if (appLoadProgress < 100) {
		return (
			<div className="app-progress-loader-container">
				<Progress
					percent={appLoadProgress}
					strokeColor="#de6834"
					type="dashboard"
				/>
				<p>{loadProgressText}</p>
			</div>
		);
	}
	const channelFilterMenu = (
		<Menu style={{ minWidth: '180px' }}>
			<Menu.Item key="unresolved">
				<Checkbox
					checked={unresolvedOnly}
					onChange={handleChangeUnresolvedOnly}
				>
					Unresolved Only
				</Checkbox>
			</Menu.Item>
		</Menu>
	);

	return (
		<Spin
			wrapperClassName={`${styles.workspacesWrapper}${isSidebarEmbed ? ` ${styles.sidebarEmbed}` : ''}`}
			spinning={channelsLoading || messagesLoading}
			indicator={<Loader />}
			size="large"
		>
			{
				isSidebarEmbed
					? (
						<div className={styles.workspacesTopbarContainer}>
							<Topbar
								channels={channels}
								currentChannel={currentChannel}
								setCurrentChannel={handleChangeChannel}
							/>
						</div>
					) : (
						<div className={styles.workspacesSidebarContainer}>
							<Sidebar
								isEmbed={isEmbed}
								sessionData={sessionData}
								isAdmin={
									sessionData?.role === UserRoles.Admin
									|| sessionData?.userId === currentWorkspace?.created_by
								}
								workspaces={workspaces}
								currentWorkspace={currentWorkspace}
								channels={channels}
								dms={dms}
								currentChannel={currentChannel}
								setCurrentWorkspace={handleChangeWorkspace}
								createChannel={createChannel}
								updateChannelName={updateChannelName}
								updateChannelPermission={updateChannelPermission}
								setCurrentChannel={handleChangeChannel}
								addUserInChannel={addUserInChannel}
								addBatchInChannel={addBatchInChannel}
								channelUsersData={channelUsersData}
								handleDMUser={handleDMUser}
								getChannelUsersList={getChannelUsersList}
								getBatchUserIds={getBatchUserIds}
								usersSidebarVisible={usersSidebarVisible}
								setUserSidebarVisible={setUserSidebarVisible}
								isChannelPermissionModalVisible={isChannelPermissionModalVisible}
								setIsChannelPermissionModalVisible={setIsChannelPermissionModalVisible}
								createWorkspace={createWorkspace}
								leaveChannel={handleChannelLeave}
							/>
						</div>
					)
			}
			<div className={`${styles.workspacesMainContainer} ${isSidebarEmbed ? ` ${styles.sidebarEmbed}` : ''}`}>
				{
					(() => {
						if (!currentWorkspace) {
							return (
								<>
									<div className={styles.toolBar}>
										<Tabs
											tabBarExtraContent={
												(
													<ProfileDropdownButton
														logout={logout}
														sessionData={sessionData}
														openProfile={() => { setProfileModalVisible(true); }}
													/>
												)
											}
										/>
									</div>
									<div className={styles.workspacePromptContainer}>
										<div>
											<h1>Hi there!</h1>
										</div>
										<div>
											<h3>&nbsp;Welcome to CQ Discussions.</h3>
										</div>
										<div>
											<span>Please select a discussion to proceed...</span>
										</div>
									</div>
								</>
							);
						} if (!currentChannel) {
							return (
								<>
									<div className={styles.toolBar}>
										<Tabs
											tabBarExtraContent={
												(
													<ProfileDropdownButton
														logout={logout}
														sessionData={sessionData}
														openProfile={() => { setProfileModalVisible(true); }}
													/>
												)
											}
										/>
									</div>
									<div className={styles.workspacePromptContainer}>
										<div>
											<OnlineWorld style={{ width: '15rem', margin: 'auto', display: 'block' }} />
											<h2>
												{`Welcome to ${currentWorkspace?.name}.`}
											</h2>
										</div>
										<div>
											<span>{channels?.length ? 'Please select a channel to see messages...' : 'Please create a channel'}</span>
										</div>
									</div>
								</>
							);
						}
						return (
							<div className={`${styles.discussionAreaContainer} ${isSidebarEmbed ? ` ${styles.sidebarEmbed}` : ''}`}>
								<Tabs
									activeKey={activeTab}
									onChange={handleTabChange}
									tabBarExtraContent={(
										<div className={styles.tabExtraContents}>
											<ProfileDropdownButton
												logout={logout}
												sessionData={sessionData}
												openProfile={() => { setProfileModalVisible(true); }}
											/>
											{activeTab === 'discussion'
												&& sessionData.role !== UserRoles.User
												&& currentChannel.type !== ChannelKind.Private
												&& !isSidebarEmbed
												? (
													<>
														<Dropdown overlay={channelFilterMenu} trigger={['click']}>
															<Tooltip placement="left" title="Filter Message">
																{
																	unresolvedOnly ? (
																		<FilterFilled
																			style={{ marginLeft: '20px', fontSize: '20px', color: '#8d8d8d' }}
																		/>
																	) : (
																		<FilterOutlined
																			style={{ marginLeft: '20px', fontSize: '20px', color: '#8d8d8d' }}
																		/>
																	)
																}
															</Tooltip>
														</Dropdown>
													</>
												) : null}
											{sessionData?.role !== '1' && !isSidebarEmbed && currentChannel?.type !== ChannelKind.Private ? (
												<Tooltip placement="left" title="Participants">
													<Button
														type="link"
														onClick={() => setUserSidebarVisible(true)}
													>
														<Users size="20px" color="#8d8d8d" />
													</Button>
												</Tooltip>
											) : ''}
											{sessionData?.role === UserRoles.Admin
												|| (
													sessionData?.userId === currentWorkspace?.created_by
													&& currentChannel?.type !== ChannelKind.Private
												) ? (
													<>
														<Tooltip placement="left" title="Settings">
															<Button
																type="link"
																onClick={() => setIsChannelPermissionModalVisible(true)}
															>
																<SettingOutlined
																	style={{ fontSize: '20px', color: '#8d8d8d' }}
																/>
															</Button>
														</Tooltip>
													</>
												) : ''}
										</div>
									)}
								>
									<Tabs.TabPane tab="Discussion" key="discussion">
										{/* pinned messsage */}

										{currentChannel.pinned_message_id && pinMsgObj && !pinMsgObj.deleted_by ? (
											<>
												<div>
													<PinMessage
														channelId={currentChannel.id}
														workspaceId={currentWorkspace.id}
														sessionData={sessionData}
														message={pinMsgObj}
														unPinMessage={unPinMessage}
														goToMessage={goToMessage}
													/>
												</div>
												<Divider style={{ margin: '0px 0' }} />
											</>
										) : ''}

										{/* pinned messsage */}
										{
											(() => {
												if (messages?.length) {
													return (
														<>
															<div className={`${styles.messagesContainer} ${isSidebarEmbed ? ` ${styles.sidebarEmbed}` : ''}`} ref={msgListContainerRef}>
																{
																	prevMessagesLoading && (
																		<Spin spinning />
																	)
																}

																{
																	memoisedMessages.map((m: any, i: number) => {
																		let ref = null;
																		if (i === 0) {
																			ref = firstMsgContainerRef;
																		} else if (memoisedMessages.length - 1 === i) {
																			ref = lastMsgContainerRef;
																		}
																		if (m.id === scrollToMsgId) {
																			ref = mergeRefs(ref, currentMsgContainerRef);
																		}

																		if (!isUnreadDividerMsgIdRef.current
																			&& parseInt(currentChannel.last_seen, 10)
																			< parseInt(m.created_at, 10)) {
																			isUnreadDividerMsgIdRef.current = m.id;
																		}

																		return (
																			<>
																				{isUnreadDividerMsgIdRef.current === m.id
																					? (<Divider style={{ borderTop: '#de6834', color: '#de6834', marginBottom: '3px' }} plain>Unread Messages</Divider>)
																					: ('')}
																				<Message
																					key={m.id}
																					ref={ref}
																					sessionData={sessionData}
																					message={m}
																					currentChannelPermission={
																						currentChannel.write_permission_type
																					}
																					currentChannelType={currentChannel.type}
																					currentChannelPinnedMessageId={
																						currentChannel.pinned_message_id
																					}
																					currentChannelLikedMessageIds={likedMessageIds}
																					repliesVisible={m.id === repliesVisibleOf}
																					copyMessageLink={copyMessageLink}
																					handleDMUser={handleDMUser}
																					createReply={createReply}
																					deleteMessage={deleteMessage}
																					verifyMessage={verifyMessage}
																					discussionRequiredToggle={discussionRequiredToggle}
																					notificationMessageToggle={notificationMessageToggle}
																					getUsersListByNamePrefix={getUsersListByNamePrefix}
																					likeMessage={likeMessage}
																					unLikeMessage={unLikeMessage}
																					pinMessage={pinMessage}
																					unPinMessage={unPinMessage}
																					deleteReply={deleteReply}
																					getReplies={getReplies}
																					uploadAttachment={uploadAttachment}
																					setRepliesVisible={setRepliesVisibleOf}
																					channelUsers={channelUsersData}
																					messageEditId={messageEditId}
																					setMessageEditId={setMessageEditId}
																					handleEditReply={handleEditReply}
																					setMessageReplyId={setMessageReplyId}
																					messageReplyId={messageReplyId}
																					isSidebarEmbed={isSidebarEmbed}
																					activeChannelId={activeChannelId}
																				/>
																			</>
																		);
																	})
																}

																{
																	nextMessagesLoading && (
																		<Spin spinning />
																	)
																}
															</div>

															{
																goToBottomVisible && (
																	<div className={styles.goToButton} style={{ position: 'absolute', bottom: 120, right: 20 }}>
																		<Tooltip title="Go to Bottom" placement="left">
																			<Button
																				type="primary"
																				shape="circle"
																				icon={<DoubleRightOutlined />}
																				onClick={goToBottom}
																				ghost
																			/>
																		</Tooltip>
																	</div>
																)
															}
														</>
													);
												}

												if (currentChannel.type === ChannelKind.Private) {
													return (
														<div className={styles.emptyDiscussionContainer}>
															<div>
																<DirectMessages style={{ width: '15rem', margin: 'auto', display: 'block' }} />
																<h2>
																	{`Welcome to direct messages of ${currentChannel?.name}.`}
																</h2>
															</div>
															<div>
																<span>
																	There are no messages right now,&nbsp;
																	type a message below to start the conversation...
																</span>
															</div>
														</div>
													);
												}

												return (
													<div className={styles.emptyDiscussionContainer}>
														<div>
															<IntroGroupChat style={{ width: '15rem', margin: 'auto', display: 'block' }} />
															<h2>
																{`Welcome to ${currentChannel?.name}.`}
															</h2>
														</div>
														<div>
															<span>
																There are no messages right now,&nbsp;
																type a message below to start the discussion...
															</span>
														</div>
													</div>
												);
											})()
										}
										<div className={styles.messageBottomEditor}>
											{(
												currentChannel.write_permission_type === channelWritePermissionType.everyone
												|| currentChannel.created_by === sessionData?.userId
											) ? (
												<div className={styles.messageEditorContainer}>
													<MessageEditor
														users={
															currentChannel.type !== ChannelKind.Private ? mentionUsers : []
														}
														sessionData={sessionData}
														createMessage={handleCreateMessage}
														uploadAttachment={uploadAttachment}
														messageEditId={messageEditId}
														setMessageEditId={setMessageEditId}
														editMessageObj={messages?.find((msg: any) => msg.id === messageEditId)}
														editMessage={handleEditMessage}
														setMessageReplyId={setMessageReplyId}
														messageReplyId={messageReplyId}
														editReplyObj=""
														channelUsers={channelUsersData}
														isSidebarEmbed={isSidebarEmbed}
														getUsersListByNamePrefix={getUsersListByNamePrefix}
														activeChannelId={activeChannelId}
														activeChannelType={currentChannel.type}
													/>
												</div>
											) : (
												<div className={styles.messageEditorContainer}>
													<MessageEditor
														users={
															currentChannel.type !== ChannelKind.Private ? mentionUsers : []
														}
														sessionData={sessionData}
														createMessage={handleCreateMessage}
														uploadAttachment={uploadAttachment}
														messageEditId={messageEditId}
														setMessageEditId={setMessageEditId}
														editMessageObj={messages?.find((msg: any) => msg.id === messageEditId)}
														editMessage={handleEditMessage}
														setMessageReplyId={setMessageReplyId}
														messageReplyId={messageReplyId}
														editReplyObj=""
														channelUsers={channelUsersData}
														isSidebarEmbed={isSidebarEmbed}
														isDisabled
														getUsersListByNamePrefix={getUsersListByNamePrefix}
														activeChannelId={activeChannelId}
														activeChannelType={currentChannel.type}
													/>
												</div>
											)}
										</div>
									</Tabs.TabPane>

									{sessionData.role !== '1' && currentChannel.type !== ChannelKind.Private ? (
										<Tabs.TabPane tab="My Activity" key="my-activity">
											{
												(() => {
													if (isActivityLoading) {
														return (
															<Spin
																indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
															/>
														);
													}

													if (userActivity?.length) {
														return (
															<>
																<div
																	className={styles.messagesContainer}
																	ref={userActivityListContainerRef}
																>
																	{
																		prevUserActivityLoading && (
																			<Spin spinning />
																		)
																	}

																	{
																		userActivity.map((a: any, i: number) => {
																			let ref = null;
																			if (i === 0) {
																				ref = firstUserActivityContainerRef;
																			}

																			return (
																				<div ref={ref} key={a.id}>
																					<strong className={styles.messageTimeContainer}>
																						{
																							`${getMessageTimeString(+a.createdAt)}  `
																						}
																					</strong>
																					<span>
																						{
																							(() => {
																								if (+a.type === UserActivityKind.AddedMessage) {
																									return <Badge style={{ backgroundColor: '#d3adf7' }} count="You have posted in discussion." />;
																								}

																								if (+a.type === UserActivityKind.AddedReply) {
																									return <Badge style={{ backgroundColor: '#95de64' }} count="You have replied in discussion." />;
																								}

																								if (+a.type === UserActivityKind.Mentioned) {
																									return <Badge style={{ backgroundColor: '#87e8de' }} count="You have been mentioned in discussion." />;
																								}

																								if (+a.type === UserActivityKind.MentionedInReply) {
																									return <Badge style={{ backgroundColor: '#69c0ff' }} count="You have been mentioned in a reply in discussion." />;
																								}

																								return null;
																							})()
																						}
																					</span>
																					<Tooltip
																						title="Go to this message"
																						getPopupContainer={
																							(trigger) => trigger.parentElement || document.body
																						}
																					>
																						<Button
																							style={{ color: '#8d8d8d', fontSize: '12px' }}
																							type="text"
																							shape="circle"
																							icon={<LinkOutlined />}
																							onClick={() => goToMessage(
																								a.workspaceId, a.channelId, a.messageId,
																							)}
																						/>
																					</Tooltip>
																					{a.messagesObj?.content?.length > 100 ? (
																						<span title={a.messagesObj?.content} style={{ display: 'block' }}>
																							{`${a.messagesObj?.content?.slice(0, 100)} ...`}
																						</span>
																					) : (
																						<span style={{ display: 'block' }}>{a.messagesObj?.content}</span>
																					)}
																					<Divider style={{ margin: '5px 0' }} />
																				</div>
																			);
																		})
																	}
																</div>
															</>
														);
													}

													return (
														<div className={styles.emptyDiscussionContainer}>
															<Empty description={false} />
															<div>
																<span>
																	There are no activities right now.
																</span>
															</div>
														</div>
													);
												})()
											}
										</Tabs.TabPane>
									) : ''}

								</Tabs>
							</div>
						);
					})()
				}
			</div>
			<ProfileModal
				setProfile={setProfile}
				visible={profileModalVisible}
				profileData={sessionData}
				isEditable
				profileUploadURL={getProfileUploadUrl()}
				closeModal={() => setProfileModalVisible(false)}
			/>
		</Spin>
	);
};
