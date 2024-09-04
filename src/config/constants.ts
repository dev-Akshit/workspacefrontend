export enum MessageEventKind {
	Add = 1,
	Edit = 2,
	Delete = 3,
}

export enum MsgNodeType {
	Message = 1,
	Divider = 2,
}

export enum ReplyEventKind {
	Add = 1,
	Edit = 2,
	Delete = 3,
}

export enum WorkspaceKind {
	Basic = 1,
	Course = 2,
	Class = 3,
}

export enum ChannelKind {
	Basic = 1,
	Course = 2,
	Class = 3,
	Private = 4,
}

export enum UserRoles {
	Admin = '0',
	User = '1',
	Mentor = '2',
	SubAdmin = '3',
	ContentCreator = '4',
	Support = '5',
	Recruiter = '6',
	Custom = '7',
}

export enum channelWritePermissionType {
	everyone = 1,
	adminsOnly = 2, // all non students are included
}

export const channelWritePermissions = {
	1: 'Everyone',
	2: 'Admins Only',
};

export enum UserActivityKind {
	AddedToWorkspace = 1,
	RemovedFromWorkspace = 2,
	AddedToChannel = 3,
	RemovedFromChannel = 4,
	AddedMessage = 5,
	AddedReply = 6,
	Mentioned = 7,
	MentionedInReply = 8,
}

export enum queryParamsMessageType {
	success = 1,
	error = 2,
}

export const validAttachments = [
	new RegExp('image/*'),
	new RegExp('text/csv'),
	new RegExp('application/pdf'),
	new RegExp('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
];
