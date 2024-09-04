import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import axios, { AxiosInstance } from 'axios';
import { Socket } from 'socket.io-client';
import { MentionItem } from 'react-mentions';
import { CreateSocket } from '../libs/socket';
import { ChannelKind, MessageEventKind, ReplyEventKind } from '../config';
import { logger } from '../libs/utils';

interface CQWorkspacesClientOptions {
	cqServerURL: string
	workspacesServerURL: string
	staticStorageApiURL: string
}

interface ClientEvents {
	'session-data': (data: any) => void

	'socket-connected': () => void
	'socket-disconnected': () => void

	'message-received': (data: any) => void
	'newMessage-received': (data: any) => void
	'reply-received': (data: any) => void
	'new-user-added': (data: any) => void
	'channel-user-change': (data: any) => void
	'isResolved-received': (data: any) => void
	'userJoinedChannel-received': (data: any) => void
	'userLeftChannel-received': (data: any) => void
	'isDiscussionRequired-received': (data: any) => void
	'updateNotifyUsersListOfMessage-received': (data: any) => void
	'likeMessage-received': (data: any) => void
	'unLikeMessage-received': (data: any) => void
	'addPin-received': (data: any) => void
	'removePin-received': (data: any) => void
}

interface SocketEmitEvents {
	joinWorkspace: (data: any) => void
	leaveWorkspace: (data: any) => void
	joinChannel: (data: any, data2: any) => void
	leaveChannel: (data: any) => void
	message: (data: any) => void
	reply: (data: any) => void
	notificationRead: (data: any) => void
	isResolved: (data: any) => void
	isDiscussionRequired: (data: any) => void
	updateNotifyUser: (data: any) => void
	getOnlineUsersListInChannel: (data: any) => void
	likeMessage: (data: any) => void
	setPinMessage: (data: any) => void
	removePinMessage: (data: any) => void
	unLikeMessage: (data: any) => void
	getUsersListByNamePrefix: (data: any) => void
	getChannelUsersList: (data: any) => void
}

interface SocketListenEvents {
	auth_succeed: (authSucceedResponse: any) => void
	message: (data: any) => void
	reply: (data: any) => void
	newUserAdded: (data: any) => void
	channelUserChange: (data: any) => void
	isResolved: (data: any) => void
	isDiscussionRequired: (data: any) => void
	updateNotifyUsersListOfMessage: (data: any) => void
	userJoinedChannel: (data: any) => void
	userLeftChannel: (data: any) => void
	newMessage: (data: any) => void
	likeMessage: (data: any) => void
	unLikeMessage: (data: any) => void
	addPin: (data: any) => void
	removePin: (data: any) => void
}

export class CQWorkspacesClient extends (EventEmitter as new () => TypedEmitter<ClientEvents>) {
	private _options: CQWorkspacesClientOptions;

	private _socket: Socket<SocketListenEvents, SocketEmitEvents>;

	private _cqAPI: AxiosInstance;

	private _workspacesAPI: AxiosInstance;

	private _staticStorageAPI: AxiosInstance;

	private _disposables: (() => void)[] = [];

	private _staticStorageURL: string;

	constructor(options: CQWorkspacesClientOptions) {
		super();

		const {
			cqServerURL,
			workspacesServerURL,
			staticStorageApiURL,
		} = options;

		const socket = CreateSocket({
			path: '/socket.io',
			endpoint: workspacesServerURL,
		});

		const workspacesAPI = axios.create({
			baseURL: workspacesServerURL,
			responseType: 'json',
			withCredentials: true,
		});

		workspacesAPI.interceptors.request.use((req) => {
			logger.log(req);

			return req;
		});

		const cqAPI = axios.create({
			baseURL: cqServerURL,
			responseType: 'json',
			withCredentials: true,
			headers: { 'Content-Type': 'application/json' },
		});

		const staticStorageAPI = axios.create({
			baseURL: staticStorageApiURL,
			responseType: 'json',
			withCredentials: true,
		});

		this._socket = socket;
		this._cqAPI = cqAPI;
		this._workspacesAPI = workspacesAPI;
		this._staticStorageAPI = staticStorageAPI;
		this._staticStorageURL = staticStorageApiURL;
		this._options = options;

		this._attachClientListeners();
		this._attachSocketListeners();

		this._disposables.push(
			this._detachClientListeners,
			this._detachSocketListeners,
			this.removeAllListeners.bind(this),
		);
	}

	private _attachClientListeners = (): void => { };

	private _detachClientListeners = (): void => { };

	private _onSocketConnect = (): void => {
		this.emit('socket-connected');
	};

	private _onSocketDisconnect = (): void => {
		this.emit('socket-disconnected');
	};

	private _onMessageReceived = (data: any): void => {
		this.emit('message-received', data);
	};

	private _onNewMessageReceived = (data: any): void => {
		this.emit('newMessage-received', data);
	};

	private _onReplyReceived = (data: any): void => {
		this.emit('reply-received', data);
	};

	private _onNewUserAdded = (data: any): void => {
		this.emit('new-user-added', data);
	};

	private _onInvitedUserAdded = (data: any): void => {
		this.emit('channel-user-change', data);
	};

	private _onResolvedChange = (data: any): void => {
		this.emit('isResolved-received', data);
	};

	private _onUserJoinedChannel = (data: any): void => {
		this.emit('userJoinedChannel-received', data);
	};

	private _onUserLeftChannel = (data: any): void => {
		this.emit('userLeftChannel-received', data);
	};

	private _onDiscussionChange = (data: any): void => {
		this.emit('isDiscussionRequired-received', data);
	};

	private _onUpdateNotifyUsersListOfMessage = (data: any): void => {
		this.emit('updateNotifyUsersListOfMessage-received', data);
	};

	private _onLikeMessage = (data: any): void => {
		this.emit('likeMessage-received', data);
	};

	private _onUnLikeMessage = (data: any): void => {
		this.emit('unLikeMessage-received', data);
	};

	private _onAddPin = (data: any): void => {
		this.emit('addPin-received', data);
	};

	private _onRemovePin = (data: any): void => {
		this.emit('removePin-received', data);
	};

	private _attachSocketListeners = (): void => {
		const { _socket } = this;

		_socket.on('connect', this._onSocketConnect);
		_socket.on('disconnect', this._onSocketDisconnect);
		_socket.on('message', this._onMessageReceived);
		_socket.on('newMessage', this._onNewMessageReceived);
		_socket.on('reply', this._onReplyReceived);
		_socket.on('newUserAdded', this._onNewUserAdded);
		_socket.on('channelUserChange', this._onInvitedUserAdded);
		_socket.on('isResolved', this._onResolvedChange);
		_socket.on('isDiscussionRequired', this._onDiscussionChange);
		_socket.on('updateNotifyUsersListOfMessage', this._onUpdateNotifyUsersListOfMessage);
		_socket.on('likeMessage', this._onLikeMessage);
		_socket.on('unLikeMessage', this._onUnLikeMessage);
		_socket.on('userJoinedChannel', this._onUserJoinedChannel);
		_socket.on('userLeftChannel', this._onUserLeftChannel);
		_socket.on('addPin', this._onAddPin);
		_socket.on('removePin', this._onRemovePin);
	};

	private _detachSocketListeners = (): void => {
		const { _socket } = this;

		_socket.off('connect', this._onSocketConnect);
		_socket.off('disconnect', this._onSocketDisconnect);
		_socket.off('message', this._onMessageReceived);
		_socket.off('newMessage', this._onNewMessageReceived);
		_socket.off('reply', this._onReplyReceived);
		_socket.off('newUserAdded', this._onNewUserAdded);
		_socket.off('channelUserChange', this._onNewUserAdded);
		_socket.off('isResolved', this._onResolvedChange);
		_socket.off('isDiscussionRequired', this._onDiscussionChange);
		_socket.off('updateNotifyUsersListOfMessage', this._onUpdateNotifyUsersListOfMessage);
		_socket.off('likeMessage', this._onLikeMessage);
		_socket.off('unLikeMessage', this._onUnLikeMessage);
		_socket.off('userJoinedChannel', this._onUserJoinedChannel);
		_socket.off('userLeftChannel', this._onUserLeftChannel);
		_socket.off('addPin', this._onAddPin);
		_socket.off('removePin', this._onRemovePin);
	};

	get connected(): boolean {
		return this._socket.connected;
	}

	connectSocket = async (): Promise<void> => {
		const { _socket } = this;

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error('timed out waiting for socket connection.'));
			}, 10000);

			this.once('socket-connected', async () => {
				clearTimeout(timer);
				resolve();
			});

			_socket.connect();
		});
	};

	destroy = async (): Promise<void> => {
		const { _disposables } = this;

		await Promise.all(_disposables.map((disposable) => disposable()));
		this._disposables = [];
	};

	login = async (loginPayload: {
		email: string;
		password: string;
	}): Promise<any> => {
		try {
			const response = await this._cqAPI.post('/auth/login', loginPayload);
			if (response.data.error) {
				throw new Error(response.data.error);
			}
			this.getSessionData();
			this.connectSocket();
		} catch (error: any) {
			throw new Error(error?.message ?? 'Somthing went wrong try again.');
		}
	};

	signup = async (signupPayload: any): Promise<any> => {
		try {
			const response = await this._cqAPI.post('/auth/signup', signupPayload);
			if (response.data.error) {
				throw new Error(response.data.error);
			}
		} catch (error: any) {
			throw new Error(error?.message ?? 'Something went wrong try again.');
		}
	};

	forgot = async (forgotPasswordPayload: { email: string, reCaptcha: string }): Promise<any> => {
		try {
			const response = await this._cqAPI.post('/auth/forgot', forgotPasswordPayload);
			if (response.data.error) {
				throw new Error(response.data.error);
			}
		} catch (error: any) {
			throw new Error(error?.message ?? 'Something went wrong try again.');
		}
	};

	validatePasswordResetToken = async (token: string): Promise<void> => {
		try {
			const response = await this._cqAPI.get(`/auth/validatePasswordResetToken?token=${token}`);
			if (response.data.error) {
				throw new Error(response.data.error);
			}
		} catch (error: any) {
			throw new Error(error?.message ?? 'Something went wrong try again.');
		}
	};

	resetPassword = async (payload: { password: string, token: string }): Promise<void> => {
		try {
			const response = await this._cqAPI.post('/auth/resetPassword', payload);
			if (response.data.error) {
				throw new Error(response.data.error);
			}
		} catch (error: any) {
			throw new Error(error?.message ?? 'Something went wrong try again.');
		}
	};

	logout = async (): Promise<void> => {
		try {
			const response = await this._cqAPI.post('/auth/logout');
			if (response.data.error) {
				throw new Error(response.data.error);
			}
			window.location.reload();
		} catch (error: any) {
			throw new Error(error?.mentions ?? 'Something went wrong try again.');
		}
	};

	getSessionData = async (): Promise<any> => {
		try {
			const response = await this._cqAPI.get('/api/auth/getLimitedSessionData');

			if (response.data.error) {
				throw new Error(response.data.error);
			}

			this.emit('session-data', response.data);

			return response.data;
		} catch (error: any) {
			throw new Error('Session Expired');
		}
	};

	createWorkspace = async (name: string, userIdsToAdd?: string[]): Promise<string> => {
		const response = await this._workspacesAPI.post('/workspace/createWorkspace', {
			name,
			userIdsToAdd,
		});
		const data = response?.data;
		if (data.error) {
			throw new Error(data.error);
		}
		return response.data?.workspaceId as string;
	};

	getWorkspaces = async (
		isAdvanced?: boolean, courseId?: string, workspaceId?: string,
		channelId?: string, messageId?: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/workspace/list', {
			courseId,
			workspaceId,
			channelId,
			messageId,
		}, {
			params: {
				isAdvanced: +(!!isAdvanced),
			},
		});

		const { data } = response;

		if (data.error) {
			throw new Error(data.error);
		}

		return response.data;
	};

	getChannels = async (workspaceId: string): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/list', {
			workspaceId,
		});

		const { data } = response;

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	};

	createChannel = async (
		workspaceId: string, name: string,
		type: ChannelKind = 1, userIdsToAdd?: string[],
		prevChannelId?: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/createChannel', {
			name,
			workspaceId,
			type,
			userIdsToAdd,
			prevChannelId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	updateChannelName = async (updatedChannelName: string, channelId: string): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/updateName', {
			updatedChannelName,
			channelId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	updateChannelPermission = async (
		channelWritePermissionType: string, channelId: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/setChannelWritePermission', {
			permissionValue: channelWritePermissionType,
			channelId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	joinWorkspace = async (workspaceId: string): Promise<any> => {
		this._socket.emit('joinWorkspace', {
			workspaceId,
		});
	};

	leaveWorkspace = async (workspaceId: string): Promise<any> => {
		this._socket.emit('leaveWorkspace', {
			workspaceId,
		});
	};

	joinChannel = async (channelId: string, workspaceId: string, callBack?: any): Promise<any> => {
		const ack = await new Promise<void>((resolve, reject) => {
			this._socket.emit('joinChannel', {
				channelId,
				workspaceId,
			}, (data: any) => {
				if (data?.error) {
					reject(new Error('failed'));
				} else {
					resolve(data);
				}
			});
		});

		return ack;
	};

	leaveChannel = async (channelId: string): Promise<any> => {
		this._socket.emit('leaveChannel', {
			channelId,
		});
	};

	leaveChannelPermanently = async (channelId: string): Promise<void> => {
		const response = await this._cqAPI.get(`/channel/leaveChannel/${channelId}`);
		if (response.data.error) {
			throw new Error(response.data.error);
		}
	};

	addUserInChannel = async (
		userEmail: string, workspaceId: string, channelId: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/addUserToChannel', {
			userEmail,
			workspaceId,
			channelId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	addBatchInChannel = async (
		batchId: string, workspaceId: string, channelId: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/channel/addBatchToChannel', {
			batchId,
			workspaceId,
			channelId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	getMessages = async (
		args: {
			workspaceId: string, channelId: string, isPrevious: number, limit: number,
			lastSeen?: number, includeLastSeen?: boolean, messageId?: string,
		},
	): Promise<any> => {
		const {
			workspaceId, channelId, isPrevious, limit, lastSeen, includeLastSeen, messageId,
		} = args;

		const response = await this._workspacesAPI.post('/message/list', {
			workspaceId,
			channelId,
			isPrevious,
			limit,
			lastRead: lastSeen,
			messageId,
			includeLastSeen,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	getUserActivity = async (
		args: {
			workspaceId: string, channelId: string, isPrevious: number,
			limit: number, lastSeen?: number, includeLastSeen?: boolean
		},
	): Promise<any> => {
		const {
			workspaceId, channelId, isPrevious, limit, lastSeen, includeLastSeen,
		} = args;

		const response = await this._workspacesAPI.post('/user/userActivityList', {
			workspaceId,
			channelId,
			isPrevious,
			limit,
			lastSeen,
			includeLastSeen,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	pinMessage = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('setPinMessage', {
			workspaceId,
			channelId,
			messageId,
		});
	};

	unPinMessage = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('removePinMessage', {
			workspaceId,
			channelId,
			messageId,
		});
	};

	getReplies = async (
		workspaceId: string, channelId: string, messageId: string,
	): Promise<any> => {
		const response = await this._workspacesAPI.post('/message/reply/list', {
			workspaceId,
			channelId,
			parentIdOfReply: messageId,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	createMessage = async (
		content: string, mentions: MentionItem[], attachments: any[],
		workspaceId: string, channelId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('message', {
			eventType: MessageEventKind.Add,
			content,
			mentions,
			attachments,
			workspaceId,
			channelId,
		});
	};

	editMessage = async (
		content: string, mentions: MentionItem[], attachments: any[],
		workspaceId: string, channelId: string, messageId: any,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('message', {
			eventType: MessageEventKind.Edit,
			content,
			mentions,
			attachments,
			workspaceId,
			channelId,
			messageId,
		});
	};

	editReply = async (
		content: string, mentions: MentionItem[], attachments: any[],
		workspaceId: string, channelId: string, messageId: any, replytoparentid: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('reply', {
			eventType: ReplyEventKind.Edit,
			content,
			mentions,
			attachments,
			workspaceId,
			channelId,
			messageId,
			replytoparentid,
		});
	};

	deleteMessage = async (
		messageId: string,
		channelId: string,
		workspaceId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('message', {
			eventType: MessageEventKind.Delete,
			messageId,
			channelId,
			workspaceId,
			time: Date.now(),
		});
	};

	verifyMessage = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
		isResolved: boolean,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('isResolved', {
			workspaceId,
			channelId,
			messageId,
			isResolved,
			time: Date.now(),
		});
	};

	discussionRequiredToggle = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
		isDiscussionRequired: boolean,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('isDiscussionRequired', {
			workspaceId,
			channelId,
			messageId,
			isDiscussionRequired,
			time: Date.now(),
		});
	};

	notificationMessageToggle = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
		isNotification: boolean,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}
		const isNotify = isNotification;
		this._socket.emit('updateNotifyUser', {
			workspaceId,
			channelId,
			messageId,
			isNotify,
			time: Date.now(),
		});
	};

	getOnlineUsers = async (
		channelId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		const response = await this._workspacesAPI.post('/channel/getOnlineUsersListInChannel', {
			channelId,
		});
		return response.data;
	};

	getUsersListByNamePrefix = async (
		channelId: string,
		prefix: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		const response = await this._workspacesAPI.post('/user/getUsersList', {
			channelId,
			prefix,
		});
		return (response.data && response.data.usersData) || {};
	};

	getChannelUsersList = async (
		channelId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		const response = await this._workspacesAPI.post('/user/getUsersList', {
			channelId,
		});
		return (response.data && response.data.usersData) || {};
	};

	likeMessage = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
		isLiked: boolean,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('likeMessage', {
			workspaceId,
			channelId,
			messageId,
			isLiked,
			time: Date.now(),
		});
	};

	unLikeMessage = async (
		workspaceId: string,
		channelId: string,
		messageId: string,
		isUnliked: boolean,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('unLikeMessage', {
			workspaceId,
			channelId,
			messageId,
			isUnliked,
			time: Date.now(),
		});
	};

	createReply = async (
		content: string, mentions: MentionItem[], attachments: any[],
		workspaceId: string, channelId: string, messageId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('reply', {
			eventType: MessageEventKind.Add,
			content,
			mentions,
			attachments,
			workspaceId,
			channelId,
			parentIdOfReply: messageId,
		});
	};

	deleteReply = async (
		messageId: string,
		channelId: string,
		workspaceId: string,
		replyId: string,
	): Promise<any> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('reply', {
			eventType: ReplyEventKind.Delete,
			channelId,
			workspaceId,
			messageId: replyId,
			mid: messageId,
			time: Date.now(),
		});
	};

	getChannelUsersDetails = async (userIds: string[]): Promise<any> => {
		const response = await this._cqAPI.post('/api/getUsersDetailByIds', {
			userIds,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		const usersData = response.data.usersData.reduce((usersMap: any, user: any) => ({
			...usersMap,
			[user._id]: user,
		}), {});

		return usersData;
	};

	getCourseBatches = async (courseId: string): Promise<any> => {
		const response = await this._cqAPI.get(`/api/course/batchListOfCourse/${courseId}`);

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data;
	};

	getBatchUserIds = async (batchIds: string[]): Promise<any> => {
		const response = await this._cqAPI.post('/api/batch/userIdsOfBatches', {
			batchIds,
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data.batchesArr;
	};

	uploadDataToBucket = async (file: unknown): Promise<string> => {
		const formData = new FormData();
		formData.append('attachment', file as any);

		const response = await this._staticStorageAPI.post('/uploadFileMultipart', formData, {
			headers: {
				'content-type': 'multipart/form-data',
			},
		});

		if (response.data.error) {
			throw new Error(response.data.error);
		}

		return response.data.url;
	};

	readNotification = async (notificationId: string): Promise<void> => {
		if (!this.connected) {
			throw new Error('please check your connection!');
		}

		this._socket.emit('notificationRead', {
			notificationId,
		});
	};

	getUploadProfileURL = () => `${this._staticStorageURL}/uploadProfile`;

	setProfile = async (profileData: { [key: string]: string }) => {
		const response = await this._cqAPI.post('/user/updateProfile', profileData);
		if (response.data.error) {
			throw new Error(response.data.error);
		}
		return response.data;
	};
}
