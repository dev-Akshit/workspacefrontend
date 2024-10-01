import React, { ReactNode } from 'react';
import { Avatar, Badge } from 'antd';
import { AvatarProps } from 'antd/lib/avatar';
import { stringToHSL } from '../../libs/utils';

export interface UserAvatarProps {
	size?: AvatarProps['size'];
	id: string;
	displayName: AvatarProps['children'];
	online?: boolean;
	style?: React.CSSProperties
	src?: string | ReactNode
	showAnyUserProfile?: () => void;
}

export const UserAvatar: React.FunctionComponent<UserAvatarProps> = (props) => {
	const {
		size, id, displayName, online, style, src, showAnyUserProfile,
	} = props;

	return (
		<Badge color={online ? 'green' : undefined}>
			<div
			onClick={showAnyUserProfile}
			style={showAnyUserProfile ? { cursor: 'pointer' } : {}}
			onKeyUp={() => {}}
			role="button"
			tabIndex={0}
			>
				{src ? (
					<Avatar
						src={src}
						size={size}
						style={{
							backgroundColor: stringToHSL(id),
							...style,
						}}
					>
						{typeof displayName === 'string' ? (displayName[0] || '').toUpperCase() : displayName}
					</Avatar>
				) : (
					<Avatar
						size={size}
						style={{
							backgroundColor: stringToHSL(id),
							...style,
						}}
					>
						{typeof displayName === 'string' ? (displayName[0] || '').toUpperCase() : displayName}
					</Avatar>
				)}
			</div>
		</Badge>
	);
};
