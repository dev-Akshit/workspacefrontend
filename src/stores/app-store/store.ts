import { MentionItem } from 'react-mentions';
import create, { UseStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { CQWorkspacesClient } from '../../clients';
import { WorkspaceKind } from '../../config';
import { logger } from '../../libs/utils';
import { immer } from '../middleware';

import {
	MessageEventKind, ReplyEventKind, ChannelKind, MsgNodeType,
} from '../../config/constants';

enum AppAction {
	Auth = 'auth',
	SessionDataReceived = 'session-data-received',
	SocketConnected = 'socket-connected',
	SocketDisconnected = 'socket-disconnected',
}

export interface AppState {
	disabled: boolean
	initialConnectionEstablished: boolean
	appLoading: boolean
	appLoadingText: string
	channelsLoading: boolean
	messagesLoading: boolean
	sessionData: any | null
	connected: boolean
	currentWorkspace: any | null
	workspaces: any[] | null
	channels: any[] | null
	dms: any[] | null
	currentChannel: any | null
	likedMessageIds: any | null
	messages: any | null
	workspaceUsersData: any | null
	channelUsersData: any | null
	userActivity: any | null
	activeWorkspaceId: string
	activeChannelId: string

	init: () => Promise<void>

	login: (loginPayload: { email: string, password: string, rememberMe: boolean }) => Promise<void>
	newLogin: (loginPayload: { email: string, password: string, rememberMe: boolean }) =>
Promise<void>
	signup: (signupPayload: { email: string, password: string, name: string, token: string }
	) => Promise<void>
	forgotPassword: (forgotPasswordPayload: { email: string, reCaptcha: string }) => Promise<void>
	validatePasswordResetToken: (token: string) => Promise<void>
	resetPassword: (resetPasswordPayload: { password: string, token: string }) => Promise<void>
	logout: () => Promise<void>

	setCurrentWorkspace: (workspaceId: string) => Promise<boolean>
	createWorkspace: (name: string, userIdsToAdd?: string[]) => Promise<string>
	getWorkspaces: (
		isAdvanced?: boolean, courseId?: string, workspaceId?: string,
		channelId?: string, messageId?: string
	) => Promise<string>

	setCurrentChannel: (channelId: string) => Promise<boolean>
	updateChannelLastSeen: (channelId: string) => Promise<void>
	getChannels: (workspaceId: string, setLoading?: boolean, goToChannelId?: string) => Promise<void>
	createChannel: (
		name: string, type?: ChannelKind, userIdsToAdd?: string[]
	) => Promise<void | string>
	deleteChannel: (channelId: string) => Promise<void>
	updateChannelName: (name: string) => Promise<void>
	updateChannelPermission: (channelWritePermissionType: string) => Promise<void>
	addUserInChannel: (userEmail: string) => Promise<void>
	removeUserFromChannel: (userIdToRemove: string) => Promise<any>
	addBatchInChannel: (batchId: string) => Promise<void>
	editChannelInviteLink: (inviteLinkSuffix: string) => Promise<void>
	customLinkJoin: (suffix: string) => Promise<void>

	getMessages: (
		limit: number, messageId?: string, includeLastSeen?: boolean
	) => Promise<string>
	getPrevMessages: (limit: number) => Promise<boolean>
	getNextMessages: (limit: number) => Promise<boolean>
	getReplies: (messageId: string) => Promise<void>
	createMessage: (content: string, mentions: MentionItem[], attachments: any[]) => Promise<boolean>
	editMessage: (content: string, mentions: MentionItem[], attachments: any[],
		messageEditId: string | undefined) => Promise<void>

	editReply: (content: string, mentions: MentionItem[], attachments: any[],
		messageEditId: string | undefined, replytoparentid: string) => Promise<void>
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

	getPinMessageDetails: (
		messageId: string,
	) => Promise<void>

	discussionRequiredToggle: (
		messageId: string,
		isDiscussionRequired: boolean,
	) => Promise<void>

	notificationMessageToggle: (
		messageId: string,
		isNotification: boolean,
	) => Promise<void>

	getOnlineUsers: (

	) => Promise<void>

	getUsersListByNamePrefix: (
		payload: any
	) => Promise<void>

	getChannelUsersList: (
		payload: any
	) => Promise<void>

	likeMessage: (
		messageId: string,
		isLiked: boolean,
	) => Promise<void>

	unLikeMessage: (
		messageId: string,
		isUnLiked: boolean,
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

	uploadAttachment: (data: unknown) => Promise<string>

	readNotification: (notificationId: string) => Promise<void>

	getUserActivity: (limit: number, isPrevious?: boolean) => Promise<boolean>

	getBatchUserIds: (batchIds: string[]) => Promise<any>

	leaveChannel: (channelId: string) => Promise<boolean>

	getProfileUploadUrl: () => string,

	setProfile: (data: { [key: string]: string }) => Promise<void>
}

const initialState: AppState = {
	disabled: false,
	initialConnectionEstablished: false,
	appLoading: false,
	appLoadingText: '',
	channelsLoading: false,
	messagesLoading: false,
	sessionData: null,
	connected: false,
	currentWorkspace: null,
	workspaces: null,
	channels: null,
	dms: null,
	currentChannel: null,
	likedMessageIds: null,
	messages: null,
	workspaceUsersData: null,
	channelUsersData: null,
	userActivity: null,
	activeWorkspaceId: '',
	activeChannelId: '',

	init: async () => { },
	login: async () => { },
	newLogin: async () => { },
	signup: async () => { },
	forgotPassword: async () => { },
	validatePasswordResetToken: async () => { },
	resetPassword: async () => { },
	logout: async () => { },

	setCurrentWorkspace: async () => false,
	createWorkspace: async () => '',
	getWorkspaces: async () => '',

	setCurrentChannel: async () => false,
	updateChannelLastSeen: async () => { },
	getChannels: async () => { },
	createChannel: async () => { },
	updateChannelName: async () => { },
	updateChannelPermission: async () => { },
	addUserInChannel: async () => { },
	removeUserFromChannel: async () => { },
	addBatchInChannel: async () => { },
	editChannelInviteLink: async () => { },
	customLinkJoin: async () => { },

	getMessages: async () => '',
	getPrevMessages: async () => false,
	getNextMessages: async () => false,
	getReplies: async () => { },
	createMessage: async () => false,
	editMessage: async () => { },
	editReply: async () => { },

	createReply: async () => { },
	deleteMessage: async () => { },
	verifyMessage: async () => { },
	getPinMessageDetails: async () => { },
	discussionRequiredToggle: async () => { },
	notificationMessageToggle: async () => { },
	getOnlineUsers: async () => { },
	getUsersListByNamePrefix: async () => { },
	getChannelUsersList: async () => { },
	likeMessage: async () => { },
	unLikeMessage: async () => { },
	pinMessage: async () => { },
	unPinMessage: async () => { },
	deleteReply: async () => { },
	uploadAttachment: async () => '',
	readNotification: async () => { },
	getUserActivity: async () => false,
	getBatchUserIds: async () => { },
	leaveChannel: async (id: string) => false,
	getProfileUploadUrl: () => '',
	setProfile: async () => {},
	deleteChannel: async () => {},
};

export function createAppStore(cqWorkspacesClient: CQWorkspacesClient): UseStore<AppState> {
	return create<AppState>(immer(devtools((set, get) => {
		const setWorkspacesList = async (data: any) => {
			logger.log('workspaces list ===> ', data);

			const workspaces = data.sort(
				(w1: any, w2: any) => w1.name.localeCompare(w2.name),
			);

			if (workspaces?.length === 0) {
				const { currentWorkspace, currentChannel } = get();
				console.log(currentChannel, currentWorkspace);
				set({ activeWorkspaceId: '', currentWorkspace: '', currentChannel: '' });
			}

			set({
				workspaces,
			});
		};

		const setActiveWorkspace = async (workspaceId: any) => {
			logger.log('active workspace ID ===> ', workspaceId);

			const { workspaces } = get();

			const workspace = workspaces?.find((w) => w.id === workspaceId);
			if (!workspace) {
				logger.error('no matching workspace found!');
				throw new Error('Workspace not allowed');
				return;
			}

			cqWorkspacesClient.joinWorkspace(workspace.id);

			let batches;
			if (workspace.type === WorkspaceKind.Course) {
				batches = await cqWorkspacesClient.getCourseBatches(workspace.course_id);
			}

			set({
				currentWorkspace: {
					...workspace,
					batches: batches ?? [],
				},
				activeWorkspaceId: workspaceId,
			});
		};

		const setWorkspaceUsersList = async (data: any) => {
			logger.log('active workspace users data ===> ', data);

			set({
				workspaceUsersData: data,
			});
		};

		const setChannelUsersData = async (data: any) => {
			set({
				channelUsersData: data,
			});
		};

		const updateChannelUsersData = async (data: any = {}) => {
			const { channelUsersData } = get();
			set({
				channelUsersData: { ...channelUsersData, ...data },
			});
		};

		const setChannelsList = async (data: any) => {
			logger.log('channels list ===> ', data);

			if (!data) {
				return;
			}

			let channels = data.filter((c: any) => c.type !== ChannelKind.Private).sort(
				(c1: any, c2: any) => c1.name.localeCompare(c2.name),
			);

			channels = channels.sort(
				(c1: any, c2: any) => (
					(c2.totalMsgCount - c2.total_read) - (c1.totalMsgCount - c1.total_read)
				),
			);

			const dms = data.filter((d: any) => d.type === ChannelKind.Private).sort(
				(d1: any, d2: any) => d1.name.localeCompare(d2.name),
			);

			set({
				channels,
				dms,
			});
		};

		const setActiveChannel = async (channelId: any) => {
			logger.log('active channel ID ===> ', channelId);

			const {
				channels, dms, currentWorkspace, channelUsersData, sessionData, currentChannel,
			} = get();

			let channel = channels?.find((c) => c.id === channelId);
			if (!channel) {
				channel = dms?.find((d) => d.id === channelId);
			}
			if (!channel) {
				logger.error('no matching channel found!');
				throw new Error('Channel not allowed');
			}

			const prevChId = currentChannel?.id;

			// const channelUsersData: any = {};
			// channel.user_ids.forEach((userId: string) => {
			// 	channelUsersData[userId] = workspaceUsersData[userId];
			// });

			// channel.removed_user_ids?.forEach((userId: string) => {
			// 	channelUsersData[userId] = workspaceUsersData[userId];
			// });

			const responseData = await cqWorkspacesClient.joinChannel(channel.id, currentWorkspace.id);
			let likedMessageIds = [];
			const workspaceId = currentWorkspace.id;

			if (responseData && responseData.likedMessageIds && channel) {
				if (typeof responseData.likedMessageIds === 'string') {
					likedMessageIds = JSON.parse(responseData.likedMessageIds);
				} else {
					likedMessageIds = responseData.likedMessageIds;
				}
			}

			let pinnedMsbObj: any = null;
			let usersData: any = {};
			if (channel?.pinned_message_id) {
				// getMessage
				const dataObj = await cqWorkspacesClient.getMessages(
					{
						workspaceId,
						channelId,
						isPrevious: 0,
						limit: 1,
						includeLastSeen: true,
						messageId: channel.pinned_message_id,
					},
				) || {};

				if (dataObj?.messagesArr?.length) {
					pinnedMsbObj = dataObj.messagesArr;
				}
				usersData = dataObj?.usersData;
			}

			// channel.last_seen = Date.now();
			channel.total_read = channel.totalMsgCount;

			if (pinnedMsbObj && pinnedMsbObj.length) {
				const [a, ...b] = pinnedMsbObj;
				channel.pinnedMsgObj = a;
				if (typeof channel.pinnedMsgObj.created_by !== 'object') {
					channel.pinnedMsgObj.created_by = usersData[channel.pinnedMsgObj.created_by];
				}
			}

			const userDataObj = {
				_id: sessionData.userId,
				displayname: sessionData.displayname,
				role: sessionData.role,
				email: sessionData.email,
				profilePic: sessionData.profilePic,
			};

			set({
				currentChannel: channel,
				likedMessageIds,
				activeChannelId: channelId,
				channelUsersData: { ...usersData, [sessionData.userId]: userDataObj },
				userActivity: [],
			});
		};

		const setMessagesList = async (data: any) => {
			logger.log('messages list ===> ', data);

			let mId = '';

			if (!data) {
				console.log('should not go here!', data);
				return mId;
			}

			const {
				channelUsersData, messages, currentChannel,
			} = get();

			const savedReplies: any = {};
			messages?.forEach((val: any) => {
				if (val?.replies) {
					savedReplies[val.id] = val?.replies;
				}
			});

			const fetchedMessages = data.map((message: any) => ({
				...message,
				created_by: channelUsersData[message.created_by],
			})).sort((a: any, b: any) => +a.created_at - +b.created_at);

			fetchedMessages?.forEach((val: any, index: number) => {
				if (savedReplies[val.id]) {
					fetchedMessages[index].replies = savedReplies[val.id];
				}
			});

			fetchedMessages.forEach((val: any, index: number) => {
				if (val) {
					const likedByCount = fetchedMessages[index].liked_by?.length
						|| fetchedMessages[index].likedByCount || 0;

					fetchedMessages[index] = { ...fetchedMessages[index], likedByCount };
				}
			});

			const filteredMessages = fetchedMessages.filter(
				(m: any) => m.created_at - 500 > currentChannel.last_seen,
			);

			if (filteredMessages.length) {
				mId = filteredMessages[0].id;
			} else {
				mId = fetchedMessages[fetchedMessages.length - 1]?.id;
			}

			set({
				messages: fetchedMessages,
			});

			return mId;
		};

		cqWorkspacesClient.on('message-received', async (data: any) => {
			logger.log(data);

			const {
				messages, channelUsersData, sessionData,
				currentChannel, currentWorkspace,
			} = get();

			if (
				currentWorkspace?.id !== data.workspaceId
				|| currentChannel?.id !== data.channelId
			) {
				return;
			}

			set((state) => {
				const curChannel = state.currentChannel;
				curChannel.last_seen = Date.now();
			});

			if (data.payload.eventType === MessageEventKind.Edit) {
				set((state) => {
					const currentActiveChannel: any = state;
					const message = state.messages?.find((msg: any) => msg.id === data.payload.messageId);
					const { channels } = state;
					const channel = channels?.find((c) => c.id === currentChannel.id);
					if (channel && channel.pinned_message_id === data.payload.messageId) {
						channel.pinnedMsgObj.content = data.payload.content;
						channel.pinnedMsgObj.attachments = data.payload.attachments;
						channel.pinnedMsgObj.mentions = data.payload.mentions;
						currentActiveChannel.currentChannel.pinnedMsgObj = {
							...currentActiveChannel.currentChannel.pinnedMsgObj,
							content: data.payload.content,
							attachments: data.payload.attachments,
							mentions: data.payload.mentions,
						};
					}
					message.content = data.payload.content;
					message.status = data.payload.eventType;
					message.attachments = data.payload.attachments;
					message.mentions = data.payload.mentions;
				});
			}

			if (data.payload.eventType === MessageEventKind.Delete) {
				// delete

				set((state) => {
					const message = state.messages?.find((msg: any) => msg.id === data.payload.messageId);
					const storeState: any = state;
					const { channels } = state;
					const channel = channels?.find((c) => c.id === currentChannel.id);
					if (channel && channel.pinned_message_id === data.payload.messageId) {
						channel.pinned_message_id = null;
						channel.pinnedMsgObj = null;
						storeState.currentChannel.pinnedMsgObj = null;
					}
					message.status = data.payload.eventType;
					message.deleted_at = data.payload.time;
					message.deleted_by = data.payload.userId;
				});
			}

			if (data.payload.eventType === MessageEventKind.Add && sessionData?.userId !== data.userId) {
				if (Array.isArray(messages)) {
					set({
						messages: messages.concat([{
							id: data.messageId,
							content: data.payload.content,
							mentions: data.payload.mentions,
							attachments: data.payload.attachments,
							created_by: data.usersData[data.payload.userId],
							created_at: data.createdAt,
							status: data.payload.eventType,
						}]),
						channelUsersData: { ...data.usersData, ...channelUsersData },
					});
				} else {
					set({
						messages: [{
							id: data.messageId,
							content: data.payload.content,
							mentions: data.payload.mentions,
							attachments: data.payload.attachments,
							created_by: data.usersData[data.payload.userId],
							created_at: data.createdAt,
							status: data.payload.eventType,
						}],
						channelUsersData: { ...data.usersData, ...channelUsersData },
					});
				}
			}
		});

		cqWorkspacesClient.on('reply-received', async (data: any) => {
			logger.log(data);

			if (data.payload.eventType === ReplyEventKind.Edit) {
				set((state) => {
					const message = state.messages?.find(
						(msg: any) => msg.id === data.payload.replytoparentid,
					);
					if (!message)		return;
					const rply = message.replies?.find((rpl: any) => rpl.id === data.payload.messageId);
					rply.content = data.payload.content;
					rply.status = data.payload.eventType;
					rply.attachments = data.payload.attachments;
					rply.mentions = data.payload.mentions;
				});
				// replytoparentid
			}

			if (data.payload.eventType === ReplyEventKind.Delete) {
				set((state) => {
					const message = state.messages?.find((msg: any) => msg.id === data.payload.mid);
					if (!message)		return;
					const rply = message.replies?.find((rpl: any) => rpl.id === data.payload.messageId);
					rply.status = data.payload.eventType;
					rply.deleted_at = data.payload.time;
					rply.deleted_by = data.payload.userId;
				});
			}

			if (data.payload.eventType === ReplyEventKind.Add) {
				set((state) => {
					const { messages, channelUsersData } = state;

					const message = messages?.find((msg: any) => msg.id === data.payload.parentIdOfReply);
					if (!message)		return;
					message.is_resolved = false;

					if (message.replyids) {
						message.replyids.push(data.messageId);
					} else {
						message.replyids = [data.messageId];
					}

					if (message.replies) {
						message.replies.push({
							id: data.messageId,
							content: data.payload.content,
							mentions: data.payload.mentions,
							attachments: data.payload.attachments,
							created_by: data.usersData[data.payload.userId],
							created_at: new Date(),
							status: data.payload.eventType,
							replytoparentid: data.payload.parentIdOfReply,
						});
					} else {
						message.replies = [{
							id: data.messageId,
							content: data.payload.content,
							mentions: data.payload.mentions,
							attachments: data.payload.attachments,
							created_by: data.usersData[data.payload.userId],
							created_at: new Date(),
							status: data.payload.eventType,
							replytoparentid: data.payload.parentIdOfReply,
						}];
					}
				});
			}
		});

		cqWorkspacesClient.on('session-data', async (data) => {
			logger.log('session data ---> ', data);

			if (data) {
				set({
					sessionData: data.session,
				}, false, AppAction.SessionDataReceived);
			}
		});

		cqWorkspacesClient.on('new-user-added', async (data: any) => {
			logger.log('new user data received', data);
			if (data.userIds && data.userIds.length) {
				const userData = await cqWorkspacesClient.getChannelUsersDetails(data.userIds);

				set((state) => {
					const {
						currentChannel, channels,
					} = state;

					const {
						channelUsersData, workspaceUsersData,
					} = state;

					if (currentChannel) {
						const addedUserIds = data.userIds.filter(
							(uId: string) => !currentChannel.user_ids.includes(uId),
						);
						currentChannel.user_ids = [...currentChannel.user_ids, ...addedUserIds];

						const channel = channels?.find((c) => c.id === currentChannel.id);
						if (channel) {
							channel.user_ids = [...channel.user_ids, ...addedUserIds];
						}

						// eslint-disable-next-line no-param-reassign
						state.channelUsersData = {
							...channelUsersData,
							...userData,
						};
					}

					// eslint-disable-next-line no-param-reassign
					state.workspaceUsersData = {
						...workspaceUsersData,
						...userData,
					};
				});
			}
		});

		cqWorkspacesClient.on('channel-user-change', async (data: any) => {
			logger.log('invited user data received', data);
			const { currentChannel } = get();
			const newChannel = { ...currentChannel };
			if (newChannel.user_ids) {
				newChannel.user_ids = newChannel.user_ids.concat(data.userIds);
			}
			set((state) => {
				// eslint-disable-next-line no-param-reassign
				state.currentChannel = newChannel;
			});
		});

		cqWorkspacesClient.on('channelUserDataChange-received', async (data: any) => {
			logger.log('channel user data change received', data);
			const { channelUsersData, currentChannel } = get();
			const responseData = await cqWorkspacesClient.channelUsersData({
				userIds: currentChannel?.user_ids,
			});
			set((state) => {
				// eslint-disable-next-line no-param-reassign
				state.channelUsersData = { ...responseData.usersData };
			});
		});

		cqWorkspacesClient.on('deleteChannel-received', async (data: any) => {
			logger.log('Channel is deleted by channel admin');
			const { currentWorkspace } = get();
			if (currentWorkspace.id === data.workspaceId) {
				await get().getWorkspaces();
			}
		});

		cqWorkspacesClient.on('removeUserByChannelAdmin-received', async (data: any) => {
			logger.log('remove user by channel admin', data);
			const { currentWorkspace, sessionData } = get();
			const { currentChannel } = get();
			const newChannel = { ...currentChannel };
			if (newChannel.user_ids && sessionData.userId === currentWorkspace.created_by) {
				newChannel.user_ids = newChannel.user_ids.filter((id: string) => data.userIds !== id);
				set((state) => {
					// eslint-disable-next-line no-param-reassign
					state.currentChannel = newChannel;
				});
				return;
			}
			if (currentWorkspace.id === data.workspaceId) {
				await get().getWorkspaces();
			}
		});

		cqWorkspacesClient.on('isResolved-received', async (data: any) => {
			set((state) => {
				const message = state.messages?.find((msg: any) => msg.id === data.messageId);
				if (message) {
					message.is_resolved = data.isResolved;
				}
			});
		});

		cqWorkspacesClient.on('userJoinedChannel-received', async (data: any) => {
			// set((state) => {
			// 	if (data && data.userId) {
			// 		const { channelUsersData } = state;
			// 		if (channelUsersData && channelUsersData[data.userId]) {
			// 			channelUsersData[data.userId].online = true;
			// 		}
			// 	}
			// });
		});

		cqWorkspacesClient.on('userLeftChannel-received', async (data: any) => {
			// set((state) => {
			// 	if (data && data.userId) {
			// 		const { channelUsersData } = state;
			// 		if (channelUsersData && channelUsersData[data.userId]) {
			// 			channelUsersData[data.userId].online = false;
			// 		}
			// 	}
			// });
		});
		cqWorkspacesClient.on('isDiscussionRequired-received', async (data: any) => {
			set((state) => {
				const message = state.messages?.find((msg: any) => msg.id === data.messageId);
				if (message) {
					message.is_discussion_required = data.isDiscussionRequired;
				}
			});
		});

		cqWorkspacesClient.on('updateNotifyUsersListOfMessage-received', async (data: any) => {
			// console.log(data);
			set((state) => {
				const message = state.messages?.find((msg: any) => msg.id === data.messageId);
				if (message) {
					if (typeof message?.notify_user_ids === 'string') {
						message.notify_user_ids = JSON.parse(message?.notify_user_ids);
					}
					if (data.isNotify) {
						if (!message.notify_user_ids) {
							message.notify_user_ids = [];
						}
						message.notify_user_ids.push(data.userId);
					} else {
						const index = message.notify_user_ids.indexOf(data.userId);
						if (index > -1) {
							message.notify_user_ids.splice(index, 1);
						}
					}
				}
			});
		});

		cqWorkspacesClient.on('likeMessage-received', async (data: any) => {
			const { userId, messageId } = data;
			const { sessionData } = get();
			if (data.isLiked) {
				set((state) => {
					let { likedMessageIds } = state;
					const message = state.messages?.find((msg: any) => msg.id === messageId);
					if (messageId && likedMessageIds && sessionData.userId === userId) {
						if (typeof likedMessageIds === 'string') {
							likedMessageIds = JSON.parse(likedMessageIds);
						}
						if (Array.isArray(likedMessageIds)) {
							likedMessageIds.push(messageId);
						}
					}
					if (message) {
						// message.likedByCount = message.liked_by?.length || message.likedByCount || 0;
						if (message.likedByCount == null) {
							message.likedByCount = 0;
						}
						message.likedByCount += 1;
					}
				});
			} else {
				set((state) => {
					const { likedMessageIds } = state;
					const message = state.messages?.find((msg: any) => msg.id === messageId);
					const ch2 = JSON.parse(JSON.stringify(likedMessageIds));
					if (messageId && likedMessageIds && likedMessageIds && sessionData.userId === userId) {
						const index = ch2?.indexOf(messageId);
						if (index > -1) {
							likedMessageIds.splice(index, 1);
						}
					}
					if (message) {
						if (message.likedByCount) {
							message.likedByCount -= 1;
						}
					}
				});
			}
		});

		cqWorkspacesClient.on('unLikeMessage-received', async (data: any) => {
			return;
			const { userId, messageId } = data;
			if (data.isUnliked) {
				set((state) => {
					const message = state.messages?.find((msg: any) => msg.id === messageId);
					if (message) {
						// add user in unliked list
						if (!message.unliked_by) {
							message.unliked_by = [];
						}
						message.unliked_by.push(userId);

						// remove user from liked list if exist
						if (!message.liked_by) {
							message.liked_by = [];
						}
						const index = message.liked_by.indexOf(userId);
						if (index > -1) {
							message.liked_by.splice(index, 1);
						}
					}
				});
			} else {
				set((state) => {
					const message = state.messages?.find((msg: any) => msg.id === messageId);
					if (message) {
						const index = message.unliked_by.indexOf(userId);
						if (index > -1) {
							message.unliked_by.splice(index, 1);
						}
					}
				});
			}
		});

		cqWorkspacesClient.on('newMessage-received', async (data: any) => {
			if (data?.isEdit) return;
			set((state) => {
				const foundChannel = state.channels?.find((ch: any) => ch.id === data.channelId);
				const { currentChannel } = state;
				if (foundChannel) {
					foundChannel.totalMsgCount += 1;
					if (currentChannel && currentChannel.id === foundChannel.id) {
						foundChannel.total_read = foundChannel.totalMsgCount;
						currentChannel.totalMsgCount = foundChannel.totalMsgCount;
						currentChannel.total_read = foundChannel.total_read;
					}
				}

				if (!foundChannel) {
					// check for dms
					const foundDm = state.dms?.find((dm: any) => dm.id === data.channelId);
					if (foundDm) {
						foundDm.totalMsgCount += 1;
						if (currentChannel && currentChannel.id === foundDm.id) {
							foundDm.total_read = foundDm.totalMsgCount;
							currentChannel.totalMsgCount = foundDm.totalMsgCount;
							currentChannel.total_read = foundDm.total_read;
						}
					}
				}
			});
		});

		cqWorkspacesClient.on('addPin-received', async (data: any) => {
			const { messages, channelUsersData, currentChannel } = get();
			if (currentChannel.id === data.channelId) {
				let foundMsg = messages?.find((msg: any) => msg.id === data.messageId);
				let usersData:any = {};
				if (!foundMsg) {
					const dataObj = await cqWorkspacesClient.getMessages(
						{
							workspaceId: data.workspaceId,
							channelId: data.channelId,
							isPrevious: 0,
							limit: 1,
							includeLastSeen: true,
							messageId: data.messageId,
						},
					);

					if (dataObj?.messagesArr?.length) {
						const [a, ...b] = dataObj.messagesArr;
						foundMsg = a;
					}
					usersData = dataObj?.usersData || {};
				}
				set((state) => {
					const currentCh = state.currentChannel;
					const foundCh = state.channels?.find((ch: any) => ch.id === data.channelId);
					currentCh.pinned_message_id = data.messageId;
					if (foundMsg) {
						if (typeof foundMsg.created_by !== 'object') {
							foundMsg.created_by = usersData[foundMsg.created_by];
						}
						currentCh.pinnedMsgObj = foundMsg;
						foundCh.pinnedMsgObj = foundMsg;
						foundCh.pinned_message_id = data.messageId;
					}
				});
				set({
					channelUsersData: { ...channelUsersData, ...usersData },
				});
			} else {
				console.log('update in channels array');
				set((state) => {
					const foundCh = state.channels?.find((ch: any) => ch.id === data.channelId);
					if (foundCh) {
						foundCh.pinned_message_id = data.messageId;
					}
				});
			}
		});

		cqWorkspacesClient.on('removePin-received', async (data: any) => {
			set((state) => {
				const currentCh = state.currentChannel;
				const foundCh = state.channels?.find((ch: any) => ch.id === data.channelId);
				if (currentCh.id === data.channelId) {
					currentCh.pinned_message_id = null;
					currentCh.pinnedMsgObj = null;
					foundCh.pinned_message_id = null;
					foundCh.pinnedMsgObj = null;
					foundCh.pinned_message_id = null;
				} else if (foundCh) {
					foundCh.pinned_message_id = null;
					foundCh.pinnedMsgObj = null;
					foundCh.pinned_message_id = null;
				}
			});
		});

		cqWorkspacesClient.on('socket-connected', async () => {
			logger.log('socket connected');

			const { currentWorkspace, currentChannel } = get();
			if (currentWorkspace) {
				cqWorkspacesClient.joinWorkspace(currentWorkspace.id);
			}

			if (currentChannel && currentWorkspace) {
				cqWorkspacesClient.joinChannel(currentChannel.id, currentWorkspace.id);
			}

			set({
				connected: true,
				initialConnectionEstablished: true,
			}, false, AppAction.SocketConnected);
		});

		cqWorkspacesClient.on('socket-disconnected', async () => {
			logger.log('socket disconnected');

			set({
				connected: false,
			}, false, AppAction.SocketDisconnected);
		});

		return {
			...initialState,

			init: async () => {
				try {
					set({
						appLoading: true,
					});
					await cqWorkspacesClient.getSessionData();
					await cqWorkspacesClient.connectSocket();
				} catch (e:any) {
					console.log(window.location.href);
					logger.error(e);
					if (e.message === 'Session Expired') {
						//	window.location.href = `${process.env.REACT_APP_MAIN_SERVER_URL}/login`;
						throw new Error('Session Expired');
						return e;
					}
					throw new Error('Error while connection to the server, please check your internet!');
				} finally {
					set({
						appLoading: false,
					});
				}
				return true;
			},

			login: async (loginPayload) => {
				try {
					await cqWorkspacesClient.login(loginPayload);
				} catch (error: any) {
				console.log('store throw');
					throw new Error(error?.message ?? error);
				}
			},

			newLogin: async (loginPayload) => {
				try {
					await cqWorkspacesClient.newLogin(loginPayload);
				} catch (error:any) {
					throw new Error(error?.message ?? error);
				}
			},

			forgotPassword: async (forgotPasswordPayload) => {
				try {
					await cqWorkspacesClient.forgot(forgotPasswordPayload);
				} catch (error: any) {
					throw new Error(error?.message ?? error);
				}
			},

			validatePasswordResetToken: async (token) => {
				try {
					await cqWorkspacesClient.validatePasswordResetToken(token);
				} catch (error: any) {
					throw new Error(error?.message ?? error);
				}
			},

			resetPassword: async (payload) => {
				try {
					await cqWorkspacesClient.resetPassword(payload);
				} catch (error: any) {
					throw new Error(error?.message ?? error);
				}
			},

			signup: async (signupPayload) => {
				try {
					await cqWorkspacesClient.signup(signupPayload);
				} catch (error: any) {
					throw new Error(error?.message ?? error);
				}
			},

			logout: async () => {
				try {
					await cqWorkspacesClient.logout();
				} catch (error: any) {
					throw new Error(error?.message ?? error);
				}
			},

			setCurrentWorkspace: async (workspaceId: string) => {
				const {
					workspaces, currentWorkspace, currentChannel,
				} = get();

				if (currentWorkspace?.id === workspaceId) {
					return false;
				}

				const workspace = workspaces?.find((w) => w.id === workspaceId);
				if (!workspace) {
					return false;
				}

				if (currentWorkspace) {
					cqWorkspacesClient.leaveWorkspace(currentWorkspace.id);
				}

				if (currentChannel) {
					cqWorkspacesClient.leaveChannel(currentChannel.id);
				}

				cqWorkspacesClient.joinWorkspace(workspace.id);

				let batches;
				if (workspace.type === WorkspaceKind.Course) {
					batches = await cqWorkspacesClient.getCourseBatches(workspace.course_id);
				}

				set({
					currentWorkspace: {
						...workspace,
						batches,
					},
					channels: [],
					currentChannel: null,
					messages: null,
					activeWorkspaceId: workspaceId,
					activeChannelId: '',
				});

				return true;
			},

			createWorkspace: async (name: string, userIdsToAdd?: string[]) => {
				try {
					const workspaceid = await cqWorkspacesClient.createWorkspace(name, userIdsToAdd);
					await get().getWorkspaces();
					await get().setCurrentWorkspace(workspaceid);
					return workspaceid;
				} catch (error) {
					console.log(error);
					throw error;
				}
			},

			getWorkspaces: async (
				isAdvanced?: boolean, courseId?: string, workspaceId?: string,
				channelId?: string, messageId?: string,
			) => {
				let mId = messageId ?? '';

				try {
					const data = await cqWorkspacesClient.getWorkspaces(
						isAdvanced, courseId, workspaceId, channelId, messageId,
					);

					if (data.disabled) {
						set({
							disabled: true,
						});

						return mId;
					}
					set({
						channelUsersData: {},
					});

					if (data.workspacesArr) {
						await setWorkspacesList(data.workspacesArr);
					}

					if (data.lastActiveWorkspaceId) {
						await setActiveWorkspace(data.lastActiveWorkspaceId);
					}

					// if (data.userIdsToObj) {
					// 	await setWorkspaceUsersList(data.userIdsToObj);
					// }

					// if (data.usersData) {
					// 	await setChannelUsersData(data.usersData);
					// }

					if (data.channelsArr) {
						await setChannelsList(data.channelsArr);
					}

					if (data.lastActiveChannelId) {
						await setActiveChannel(data.lastActiveChannelId);
					}

					if (data.usersData) {
						await updateChannelUsersData(data.usersData);
					}

					if (data.messagesArr) {
						if (messageId) {
							await setMessagesList(data.messagesArr);
						} else {
							mId = await setMessagesList(data.messagesArr);
						}
					}
				} catch (e) {
					logger.error(e);

					throw e;
				}

				return mId;
			},

			setCurrentChannel: async (channelId: string) => {
				const {
					channels, dms, currentChannel, currentWorkspace, channelUsersData, sessionData,
				} = get();

				if (currentChannel?.id === channelId) {
					return false;
				}

				const prevChId = currentChannel?.id;
				if (currentChannel) {
					cqWorkspacesClient.leaveChannel(currentChannel.id);
				}

				let channel = channels?.find((c) => c.id === channelId);
				if (!channel) {
					channel = dms?.find((d) => d.id === channelId);
				}
				if (!channel) {
					return false;
				}

				// const channelUsersData: any = {};
				// channel.user_ids?.forEach((userId: string) => {
				// 	channelUsersData[userId] = workspaceUsersData[userId];
				// });

				// channel.removed_user_ids?.forEach((userId: string) => {
				// 	channelUsersData[userId] = workspaceUsersData[userId];
				// });

				const responseData = await cqWorkspacesClient.joinChannel(channel.id, currentWorkspace.id);
				let likedMessageIds = [];
				const workspaceId = currentWorkspace.id;

				if (responseData && responseData.likedMessageIds && channel) {
					if (typeof responseData.likedMessageIds === 'string') {
						likedMessageIds = JSON.parse(responseData.likedMessageIds);
					} else {
						likedMessageIds = responseData.likedMessageIds;
					}
				}

				// let userIds = await cqWorkspacesClient.getOnlineUsers(
				// 	channelId,
				// );
				// userIds = userIds.userIds;
				let pinnedMsgObj: any = null;
				let uData: any = {};
				if (channel?.pinned_message_id) {
					// getMessage
					const dataObj = await cqWorkspacesClient.getMessages(
						{
							workspaceId,
							channelId,
							isPrevious: 0,
							limit: 1,
							includeLastSeen: true,
							messageId: channel.pinned_message_id,
						},
					);
					const { messagesArr = [], usersData = {} } = dataObj;
					[pinnedMsgObj] = messagesArr;
					if (pinnedMsgObj) {
						channel = { ...channel, pinnedMsgObj };
						if (typeof channel.pinnedMsgObj.created_by !== 'object') {
							channel.pinnedMsgObj.created_by = usersData[channel.pinnedMsgObj.created_by];
						}
						uData = usersData;
					}
				}
				// userIds.forEach((val: string) => {
				// 	if (usersData[val]) {
				// 		usersData[val].online = true;
				// 	}
				// });

				// channel.total_read = channel.totalMsgCount;

				set((state) => {
					// eslint-disable-next-line @typescript-eslint/no-shadow
					const { channels, dms } = state;

					let ch = channels?.find((c) => c.id === channel.id);
					// may cause error update last seen of prev channel when they change
					const prevCh = channels?.find((c) => c.id === prevChId);
					if (prevCh && prevChId) {
						prevCh.last_seen = Date.now();
					}
					// may cause error
					if (!ch) {
						ch = dms?.find((dm) => dm.id === channel.id);
					}
					ch.last_seen = Date.now();
					ch.total_read = ch.totalMsgCount;

					if (pinnedMsgObj) {
						ch.pinnedMsgObj = pinnedMsgObj;
						// if (typeof ch.pinnedMsgObj.created_by !== 'object') {
						// 	ch.pinnedMsgObj.created_by = usersData[ch.pinnedMsgObj.created_by];
						// }
					}
				});

				set({
					currentChannel: channel,
					messages: null,
					likedMessageIds,
					activeChannelId: channelId,
					channelUsersData: {
						[sessionData.userId]: {
							_id: sessionData.userId,
							displayname: sessionData.displayname,
							role: sessionData.role,
							profilePic: sessionData.profilePic,
						},
						...uData,
					},
					userActivity: [],
				});

				return true;
			},

			updateChannelLastSeen: async (channelId: string) => {
				set((state) => {
					// eslint-disable-next-line @typescript-eslint/no-shadow
					const { channels, dms, currentChannel } = state;

					let ch = channels?.find((c) => c.id === channelId);
					if (!ch) {
						ch = dms?.find((dm) => dm.id === channelId);
					}
					ch.last_seen = Date.now();
					ch.total_read = ch.totalMsgCount;

					if (currentChannel.id === channelId) {
						currentChannel.last_seen = Date.now();
					}
				});
			},

			getChannels: async (workspaceId: string, setLoading?: boolean, goToChannelId?: string) => {
				try {
					if (setLoading) {
						set({
							channelsLoading: true,
							channelUsersData: {},
						});
					}

					if (!workspaceId) {
						throw new Error('no workspaceId has been provided!');
					}

					const data = await cqWorkspacesClient.getChannels(workspaceId);

					// if (data.userIdsToObj) {
					// 	await setWorkspaceUsersList(data.userIdsToObj);
					// }

					if (data.channelsArr) {
						await setChannelsList(data.channelsArr);
					}

					if (goToChannelId) {
						await setActiveChannel(goToChannelId);
					} else if (data.lastActiveChannelId) {
						await setActiveChannel(data.lastActiveChannelId);
					}
				} catch (e) {
					logger.error(e);

					set({
						channels: null,
					});
				} finally {
					set({
						channelsLoading: false,
					});
				}
			},

			createChannel: async (name: string, type?: ChannelKind, userIdsToAdd?: string[]) => {
				try {
					if (!name || !name.trim()) {
						throw new Error('Please provide a channel name!');
					}

					const {
						currentWorkspace, channels, getChannels, currentChannel,
					} = get();

					if (!currentWorkspace) {
						throw new Error('No current workspace is found!');
					}

					if (currentChannel) {
						cqWorkspacesClient.leaveChannel(currentChannel.id);
					}

					const hasFound = channels?.findIndex((channel: any) => channel.name === name.trim());
					if (typeof hasFound === 'number' && hasFound >= 0) {
						throw new Error('Channel with the same name already exists!');
					}

					const data = await cqWorkspacesClient.createChannel(
						currentWorkspace.id, name, type, userIdsToAdd, currentChannel?.id,
					);

					logger.log(data);

					await getChannels(currentWorkspace.id, false, data?.channelId);

					return data.channelId;
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			updateChannelName: async (updatedChannelName: string) => {
				try {
					if (!updatedChannelName || !updatedChannelName.trim()) {
						throw new Error('Please provide a channel name!');
					}

					const { currentChannel, channels } = get();

					const hasFound = channels?.findIndex(
						(channel: any) => channel.name === updatedChannelName.trim(),
					);
					if (typeof hasFound === 'number' && hasFound >= 0) {
						throw new Error('Channel with the same name already exists!');
					}

					const data = await cqWorkspacesClient.updateChannelName(
						updatedChannelName, currentChannel.id,
					);

					logger.log(data);

					set((state) => {
						if (data.msg && data.channelId) {
							const channel = state.channels?.find((ch: any) => ch.id === data.channelId);
							console.log(channel);
							channel.name = updatedChannelName;
						}

						const ch = state.currentChannel;
						if (ch) {
							ch.name = updatedChannelName;
						}
					});
					return data;
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			updateChannelPermission: async (channelWritePermissionType: string) => {
				try {
					if (!channelWritePermissionType) {
						throw new Error('Please provide a channel permission!');
					}

					const { currentChannel } = get();

					const data = await cqWorkspacesClient.updateChannelPermission(
						channelWritePermissionType, currentChannel.id,
					);

					logger.log(data);

					set((state) => {
						if (channelWritePermissionType) {
							const channel = state.channels?.find((ch: any) => ch.id === currentChannel.id);
							if (channel) {
								channel.write_permission_type = channelWritePermissionType;
							}

							const ch = state.currentChannel;
							ch.write_permission_type = channelWritePermissionType;
						}
					});

					set((state) => {
						const ch = state.currentChannel;
						ch.write_permission_type = channelWritePermissionType;
					});
					return data;
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			addUserInChannel: async (userEmail: string) => {
				try {
					if (!userEmail || !userEmail.trim()) {
						throw new Error('Please provide the user\'s e-mail!');
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					const data = await cqWorkspacesClient.addUserInChannel(
						userEmail, currentWorkspace.id, currentChannel.id,
					);

					logger.log(data);
					return data;
				} catch (e) {
					logger.error(e);

					throw new Error('Error while getting user data.');
				}
			},

			removeUserFromChannel: async (userIdToRemove: string) => {
				try {
					const {
						currentChannel, currentWorkspace,
					} = get();
					if (!userIdToRemove) {
						throw new Error('Please provide user to remove from channel');
					}
					const data = await cqWorkspacesClient.removeUserFromChannel({
						userIdToRemove, channelId: currentChannel.id, workspaceId: currentWorkspace.id,
					});
					logger.log(data);
					return data;
				} catch (error) {
					logger.error(error);
					throw new Error('Error in remove user from channel');
				}
			},

			deleteChannel: async (channelId: string) => {
				const { currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				try {
					const response = await cqWorkspacesClient.deleteChannel(
						channelId, workspaceId,
					);
					return response;
				} catch (e: any) {
					logger.error(e);
					throw new Error(e?.message || 'Error in delete channel');
				}
			},

			addBatchInChannel: async (batchId: string) => {
				try {
					if (!batchId) {
						throw new Error('no batchId has been provided!');
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}
					set({
						appLoading: true,
					});
					const data = await cqWorkspacesClient.addBatchInChannel(
						batchId, currentWorkspace.id, currentChannel.id,
					);

					set((state) => {
						const { channels, currentChannel: ch } = state;
						const channel = channels?.find((c) => c.id === currentChannel.id);
						if (channel && Array.isArray(channel.batch_ids) && channel.batch_ids.length) {
							channel.batch_ids.push(batchId);
						} else {
							channel.batch_ids = [batchId];
						}

						if (Array.isArray(ch.batch_ids) && ch.batch_ids.length) {
							ch.batch_ids.push(batchId);
						} else {
							ch.batch_ids = [batchId];
						}
					});

					logger.log(data);
				} catch (e) {
					logger.error(e);

					throw e;
				} finally {
					set({
						appLoading: false,
					});
				}
			},

			editChannelInviteLink: async (inviteLinkSuffix: string) => {
				try {
					const {
						currentChannel, currentWorkspace,
					} = get();
					const response = await cqWorkspacesClient.editInviteLink({
						inviteLinkSuffix, channelId: currentChannel.id, workspaceId: currentWorkspace.id,
					});
					logger.log(response);
					set(() => ({
						currentChannel: { ...currentChannel, invite_link: response?.inviteLink },
					}));
					return response;
				} catch (error) {
					logger.error(error);
					throw new Error('Error in edit channel invite link');
				}
			},

			customLinkJoin: async (suffix: string) => {
				try {
					const response = await cqWorkspacesClient.customLinkJoin(suffix);
					logger.log(response);
				} catch (error) {
					logger.error(error);
				}
			},

			getMessages: async (limit: number, messageId?: string, includeLastSeen?: boolean) => {
				let mId = messageId ?? '';

				try {
					set({
						messagesLoading: true,
					});

					const {
						currentWorkspace, currentChannel, channelUsersData,
					} = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					if (!channelUsersData) {
						throw new Error('no current channel users data is found!');
					}

					const requests = [
						cqWorkspacesClient.getMessages({
							workspaceId: currentWorkspace.id,
							channelId: currentChannel.id,
							isPrevious: 0,
							limit,
							lastSeen: messageId ? undefined : currentChannel.last_seen,
							messageId,
							includeLastSeen,
						}),
					];

					if (messageId) {
						requests.push(
							cqWorkspacesClient.getMessages({
								workspaceId: currentWorkspace.id,
								channelId: currentChannel.id,
								isPrevious: 1,
								limit,
								messageId,
							}),
						);
					}

					const responseData = await Promise.all(requests);
					let messageUsersData = {};

					const messagesList = responseData.reduce((list, data) => {
						const { messagesArr = [], usersData = {} } = data;
						messageUsersData = { ...messageUsersData, ...usersData };
						return [...list, ...messagesArr];
					}, []);

					set({ channelUsersData: { ...channelUsersData, ...messageUsersData } });

					// fetchedMessages.forEach((val: any, index: number) => {
					// 	if (val && val.notify_user_ids && typeof val.notify_user_ids === 'string') {
					// 		fetchedMessages[index].notify_user_ids = JSON.parse(val.notify_user_ids);
					// 	}
					// });

					if (messageId) {
						await setMessagesList(messagesList);
					} else {
						mId = await setMessagesList(messagesList);
					}
				} catch (e) {
					logger.error(e);
				} finally {
					set({
						messagesLoading: false,
					});
				}

				return mId;
			},

			getPrevMessages: async (limit: number) => {
				try {
					const {
						currentWorkspace, currentChannel, channelUsersData, messages,
					} = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					if (!channelUsersData) {
						throw new Error('no current channel users data is found!');
					}

					const messageIdFetch = messages[0].id;
					// if (messages[0].msgNodeType === MsgNodeType.Divider) {
					// 	messageIdFetch = messages[1].id;
					// } else {
					// 	messageIdFetch = messages[0].id;
					// }

					const data = await cqWorkspacesClient.getMessages({
						workspaceId: currentWorkspace.id,
						channelId: currentChannel.id,
						isPrevious: 1,
						limit,
						messageId: messageIdFetch,
					});

					logger.log('prev messages ---> ', data);

					if (!data.messagesArr.length) {
						return false;
					}
					const usersData = data.usersData || {};

					const prevMessages = data.messagesArr.map((message: any) => ({
						...message,
						created_by: usersData?.[message.created_by],
					})).sort((a: any, b: any) => +a.created_at - +b.created_at);

					// init likedByCount
					prevMessages.forEach((val: any, index: number) => {
						if (val) {
							const likedByCount = prevMessages[index].liked_by?.length
								|| prevMessages[index].likedByCount || 0;
							prevMessages[index] = { ...prevMessages[index], likedByCount };
						}
					});

					set({
						messages: prevMessages.concat(messages),
						channelUsersData: { ...channelUsersData, ...usersData },
					});

					return true;
				} catch (e) {
					logger.error(e);
				}

				return false;
			},

			getNextMessages: async (limit: number) => {
				try {
					const {
						currentWorkspace, currentChannel, channelUsersData, messages,
					} = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					if (!channelUsersData) {
						throw new Error('no current channel users data is found!');
					}

					const data = await cqWorkspacesClient.getMessages({
						workspaceId: currentWorkspace.id,
						channelId: currentChannel.id,
						isPrevious: 0,
						limit,
						messageId: messages[messages.length - 1].id,
					});

					logger.log('next messages ---> ', data);

					if (!data.messagesArr.length) {
						return false;
					}

					const usersData = data.usersData || {};

					const nextMessages = data.messagesArr.map((message: any) => ({
						...message,
						created_by: usersData?.[message.created_by],
					})).sort((a: any, b: any) => +a.created_at - +b.created_at);

					// init likedByCount
					nextMessages.forEach((val: any, index: number) => {
						if (val) {
							const likedByCount = nextMessages[index].liked_by?.length
								|| nextMessages[index].likedByCount || 0;
							nextMessages[index] = { ...nextMessages[index], likedByCount };
						}
					});
					set({
						messages: messages.concat(nextMessages),
						channelUsersData: { ...channelUsersData, ...usersData },
					});

					return true;
				} catch (e) {
					logger.error(e);
				}

				return false;
			},

			getReplies: async (messageId: string) => {
				try {
					const { currentWorkspace, currentChannel, channelUsersData } = get();

					if (!messageId) {
						throw new Error('no messageId is provided!');
					}

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					if (!channelUsersData) {
						throw new Error('no current channel users data is found!');
					}

					set((state) => {
						const { messages } = state;

						const message = messages?.find((msg: any) => msg.id === messageId);

						if (!message) {
							return;
						}
						message.repliesLoader = true;
					});

					const data = await cqWorkspacesClient.getReplies(
						currentWorkspace.id, currentChannel.id, messageId,
					);
					const usersData = data?.usersData || {};

					logger.log(data);

					set((state) => {
						const { messages } = state;

						const message = messages?.find((msg: any) => msg.id === messageId);

						if (!message) {
							return;
						}

						message.replies = data.repliesArr.map((reply: any) => ({
							...reply,
							created_by: usersData[reply.created_by],
						}));

						message.repliesLoader = false;
					});
					set({
						channelUsersData: { ...channelUsersData, ...usersData },
					});
				} catch (e) {
					logger.error(e);
				}
			},

			getUserActivity: async (limit: number, isPrevious?: boolean) => {
				try {
					const {
						currentWorkspace, currentChannel, userActivity,
					} = get();

					if (!currentWorkspace) {
						throw new Error('no current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('no current channel is found!');
					}

					const data = await cqWorkspacesClient.getUserActivity({
						workspaceId: currentWorkspace.id,
						channelId: currentChannel.id,
						isPrevious: isPrevious ? 1 : 0,
						limit,
						// eslint-disable-next-line no-nested-ternary
						lastSeen: isPrevious && userActivity?.length
							? userActivity[0].createdAt : undefined,
					});

					logger.log('user activity ---> ', data);

					if (!data.userActivitiesArr.length) {
						logger.log('prev userActivities array len is zero, returning');
						return false;
					}
					const { messagesObj } = data;

					data.userActivitiesArr.forEach((val: any, index: number) => {
						data.userActivitiesArr[index].messagesObj = messagesObj[val.messageId];
					});

					const fetchedUserActivity = data.userActivitiesArr.filter(
						(activity: any) => activity.channelId === currentChannel.id,
					).sort(
						(a: any, b: any) => +a.createdAt - +b.createdAt,
					);

					set({
						userActivity: isPrevious && userActivity?.length
							? fetchedUserActivity.concat(userActivity)
							: fetchedUserActivity,
					});

					return true;
				} catch (e) {
					logger.error(e);
				}

				return false;
			},

			createMessage: async (content: string, mentions: MentionItem[], attachments: any[]) => {
				try {
					if (!content && !attachments.length) {
						return false;
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('No current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('No current channel is found!');
					}

					await cqWorkspacesClient.createMessage(
						content, mentions, attachments,
						currentWorkspace.id, currentChannel.id,
					);
					return true;
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			editMessage: async (content: string, mentions: MentionItem[],
				attachments: any[],
				messageEditId: any) => {
				try {
					if (!content && !attachments.length) {
						throw new Error('Please provide message content/attachment!');
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('No current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('No current channel is found!');
					}
					if (!messageEditId) {
						throw new Error('No Message id is present');
					}
					const messageId = messageEditId;
					await cqWorkspacesClient.editMessage(
						content, mentions, attachments,
						currentWorkspace.id, currentChannel.id, messageId,
					);
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			editReply: async (content: string, mentions: MentionItem[],
				attachments: any[],
				messageReplyId: any, replytoparentid: string) => {
				try {
					if (!content && !attachments.length) {
						throw new Error('Please provide message content/attachment!');
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('No current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('No current channel is found!');
					}
					if (!messageReplyId) {
						throw new Error('No Message id is present');
					}
					const messageId = messageReplyId;
					await cqWorkspacesClient.editReply(
						content, mentions, attachments,
						currentWorkspace.id, currentChannel.id, messageId, replytoparentid,
					);
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			createReply: async (
				content: string, mentions: MentionItem[], attachments: any[], messageId: string,
			) => {
				try {
					if (!content && !attachments.length) {
						throw new Error('Please provide reply content/attachment!');
					}

					const { currentWorkspace, currentChannel } = get();

					if (!currentWorkspace) {
						throw new Error('No current workspace is found!');
					}

					if (!currentChannel) {
						throw new Error('No current channel is found!');
					}

					await cqWorkspacesClient.createReply(
						content, mentions, attachments, currentWorkspace.id, currentChannel.id, messageId,
					);
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			verifyMessage: async (
				messageId: string,
				isResolved: boolean,
			) => {
				// set((state) => {
				// 	const message = state.messages?.find((msg: any) => msg.id === messageId);
				// 	message.is_resolved = !message.is_resolved;
				// });
				const { currentChannel, currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				const channelId = currentChannel.id;
				try {
					await cqWorkspacesClient.verifyMessage(
						workspaceId,
						channelId,
						messageId,
						isResolved,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			pinMessage: async (
				messageId: string,
			) => {
				const { currentWorkspace, currentChannel } = get();
				const channelId = currentChannel.id;
				const workspaceId = currentWorkspace.id;
				try {
					await cqWorkspacesClient.pinMessage(
						workspaceId,
						channelId,
						messageId,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			unPinMessage: async (
				messageId: string,
			) => {
				const { currentWorkspace, currentChannel } = get();
				const channelId = currentChannel.id;
				const workspaceId = currentWorkspace.id;
				try {
					await cqWorkspacesClient.unPinMessage(
						workspaceId,
						channelId,
						messageId,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			// getPinMessageDetails: async (
			// 	messageId: string,
			// ) => {
			// 	const { currentChannel, currentWorkspace } = get();
			// 	const workspaceId = currentWorkspace.id;
			// 	const channelId = currentChannel.id;
			// 	try {
			// 		await cqWorkspacesClient.getMessages(
			// 			{
			// 				workspaceId,
			// 				channelId,
			// 				isPrevious: 0,
			// 				limit: 1,
			// 				includeLastSeen: true,
			// 				messageId,
			// 			},
			// 		);
			// 	} catch (e) {
			// 		logger.error(e);
			// 	}
			// },

			discussionRequiredToggle: async (
				messageId: string,
				isDiscussionRequired: boolean,
			) => {
				const { currentChannel, currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				const channelId = currentChannel.id;
				try {
					await cqWorkspacesClient.discussionRequiredToggle(
						workspaceId,
						channelId,
						messageId,
						isDiscussionRequired,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			notificationMessageToggle: async (
				messageId: string,
				isNotification: boolean,
			) => {
				const { currentChannel, currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				const channelId = currentChannel.id;
				try {
					await cqWorkspacesClient.notificationMessageToggle(
						workspaceId,
						channelId,
						messageId,
						isNotification,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			getOnlineUsers: async () => {
				const { currentChannel } = get();
				const channelId = currentChannel.id;
				try {
					const userIds = await cqWorkspacesClient.getOnlineUsers(
						channelId,
					);
					return userIds.userIds;
				} catch (e) {
					logger.error(e);
					return null;
				}
			},

			getUsersListByNamePrefix: async (payload: any) => {
				const { channelId, prefix } = payload;
				try {
					const usersData = await cqWorkspacesClient.getUsersListByNamePrefix(channelId, prefix);
					return usersData;
				} catch (e) {
					logger.error(e);
					return null;
				}
			},

			getBatchUserIds: async (batchIds: string[]) => {
				try {
					if (batchIds.length === 0)	return { batchesArr: [] };
					const batchesArr = await cqWorkspacesClient.getBatchUserIds(batchIds);
					return batchesArr;
				} catch (e) {
					logger.error(e);
					return null;
				}
			},

			getChannelUsersList: async (payload: any) => {
				const { channelId } = payload;
				try {
					const usersData = await cqWorkspacesClient.getChannelUsersList(channelId);
					return usersData;
				} catch (e) {
					logger.error(e);
					return null;
				}
			},

			likeMessage: async (
				messageId: string,
				isLiked: boolean,
			) => {
				const { currentChannel, currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				const channelId = currentChannel.id;
				try {
					await cqWorkspacesClient.likeMessage(
						workspaceId,
						channelId,
						messageId,
						isLiked,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			unLikeMessage: async (
				messageId: string,
				isUnliked: boolean,
			) => {
				const { currentChannel, currentWorkspace } = get();
				const workspaceId = currentWorkspace.id;
				const channelId = currentChannel.id;
				try {
					await cqWorkspacesClient.unLikeMessage(
						workspaceId,
						channelId,
						messageId,
						isUnliked,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			deleteMessage: async (
				messageId: string,
			) => {
				const { currentChannel, currentWorkspace } = get();

				try {
					await cqWorkspacesClient.deleteMessage(
						messageId,
						currentChannel.id,
						currentWorkspace.id,
					);
				} catch (e) {
					logger.error(e);
				}

				// set((state) => {
				// 	const { messages } = state;

				// 	const message = messages?.find((msg:any) => msg.id === messageId);
				// 	message.status = 0;
				// 	message.deleted_at = Date.now();
				// });
			},

			deleteReply: async (
				replyId: string,
				messageId: string,
			) => {
				const { currentChannel, currentWorkspace } = get();

				try {
					await cqWorkspacesClient.deleteReply(
						messageId,
						currentChannel.id,
						currentWorkspace.id,
						replyId,
					);
				} catch (e) {
					logger.error(e);
				}
			},

			uploadAttachment: async (data: unknown) => {
				try {
					if (!data) {
						throw new Error('no data to upload.');
					}

					return await cqWorkspacesClient.uploadDataToBucket(data);
				} catch (e) {
					logger.error(e);

					throw e;
				}
			},

			readNotification: async (notificationId: string) => {
				try {
					if (!notificationId) {
						throw new Error('Please provide a notification ID!');
					}

					await cqWorkspacesClient.readNotification(notificationId);
				} catch (e) {
					logger.error(e);
				}
			},

			leaveChannel: async (channelId: string) => {
				try {
					await cqWorkspacesClient.leaveChannelPermanently(channelId);
					const { channels } = get();
					console.log(channels);
					return true;
				} catch (e) {
					logger.error(e);
					return false;
				}
			},

			getProfileUploadUrl: (): string => cqWorkspacesClient.getUploadProfileURL(),

			setProfile: async (profileData) => {
				await cqWorkspacesClient.setProfile(profileData);
				await cqWorkspacesClient.getSessionData();
			},
		};
	}, 'AppStore')));
}
