import React, { ReactNode, useState } from 'react';
import {
	EllipsisOutlined,
	LinkOutlined,
	BellFilled,
	BellOutlined,
	CloseOutlined,
	CheckOutlined,
	MessageFilled,
	MessageOutlined,
	PushpinFilled,
	PushpinOutlined,
} from '@ant-design/icons';
import {
	Dropdown,
	Menu,
	Space,
	Popconfirm,
	MenuProps,
} from 'antd';
import styles from './message-action.module.css';

export interface MessageActionProps {
	message: any | null
	sessionData: any | null
	isPinedMessage: boolean
	visibleNotMessageOwner: boolean
	visibleOnlyAdmin: boolean

	copyMessageLink: (
		messageId: string,
	) => Promise<void>
	handleToggleNotificationMessage: () => Promise<void>
	handleToggleVerifyMessage: () => Promise<void>
	handleToggleDiscussionMessage: () => Promise<void>
	handleTogglePinMessage: () => Promise<void>
}
export const MessageAction: React.FunctionComponent<MessageActionProps> = (props) => {
	const {
		message, sessionData, isPinedMessage, visibleNotMessageOwner, copyMessageLink,
		handleToggleNotificationMessage, visibleOnlyAdmin, handleToggleVerifyMessage,
		handleToggleDiscussionMessage, handleTogglePinMessage,
	} = props;
	const [visibleActions, setVisibleActions] = useState(false);

	const handleMenuClick: MenuProps['onClick'] = (e) => {
		if (e.key === 'notificationActio') {
			setVisibleActions(true);
		} else {
			setVisibleActions(false);
		}
	};

	const handleVisibleChange = (flag: boolean) => {
		setVisibleActions(flag);
	};

	const menu = (
		<Menu onClick={handleMenuClick} style={{ minWidth: '180px' }}>
			{visibleNotMessageOwner || visibleOnlyAdmin ? (
				<Menu.Item key="copyMsgLinkAction" onClick={() => copyMessageLink(message.id)}>
					<div className={styles.menuItemDiv}>
						<LinkOutlined />
						<span>Copy message link</span>
					</div>
				</Menu.Item>
			) : ''}
			{visibleNotMessageOwner ? (
				<>
					<Menu.Item key="notificationAction" onClick={() => handleToggleNotificationMessage()}>
						<div className={styles.menuItemDiv}>
							{message?.notify_user_ids?.includes(sessionData?.userId) ? (
								<BellFilled />) : (<BellOutlined />)}
							<span>{message?.notify_user_ids?.includes(sessionData?.userId) ? 'Stop notification' : 'Start notification'}</span>
						</div>
					</Menu.Item>
				</>
			) : ''}
			{visibleOnlyAdmin ? (
				<>
					<Menu.Item key="verifyAction" onClick={() => handleToggleVerifyMessage()}>
						<div className={styles.menuItemDiv}>
							{message.is_resolved ? (<CloseOutlined />) : (<CheckOutlined />)}
							<span>{message.is_resolved ? 'Mark unresolve' : 'Mark resolve'}</span>
						</div>
					</Menu.Item>
					<Menu.Item key="discussAction" onClick={() => handleToggleDiscussionMessage()}>
						<div className={styles.menuItemDiv}>
							{message.is_discussion_required ? (<MessageFilled />) : (<MessageOutlined />)}
							<span>{message.is_discussion_required ? 'Not to discuss' : 'To discuss'}</span>
						</div>
					</Menu.Item>
					<Menu.Item key="pinAction" onClick={() => handleTogglePinMessage()}>
						<div className={styles.menuItemDiv}>
							{isPinedMessage ? (<PushpinFilled />) : (<PushpinOutlined />)}
							<span>{isPinedMessage ? 'Unpin message' : 'Pin message'}</span>
						</div>
					</Menu.Item>
				</>
			) : ''}
		</Menu>
	);
	return (
		<Dropdown overlay={menu} onVisibleChange={handleVisibleChange} visible={visibleActions}>
			<Space>
				{visibleNotMessageOwner || visibleOnlyAdmin ? (
					<span style={{
						position: 'relative',
						top: '-.05rem',
						cursor: 'pointer',
						color: '#9F9F9F',
					}}
					>
						•••
					</span>
				) : ''}
			</Space>
		</Dropdown>
	);
};
