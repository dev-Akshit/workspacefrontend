import React, { ReactNode } from 'react';
import { Popconfirm } from 'antd';
import { UserAvatar } from '../avatar';
import { stringToHSL } from '../../libs/utils';
import ChatIcon from '../../assets/icons/material-chat.svg';
import styles from './user-details-card.module.css';

export interface UserDetailsCardProps {
	id: string
	src?: string | ReactNode
	displayName: string
	email: string
	showEmail?: boolean
	showDm?: boolean
	handleDMUser?: (userId: string) => Promise<void>
	userStatus?: string
}

export const UserDetailsCard: React.FunctionComponent<UserDetailsCardProps> = (props) => {
	const {
		id, src, displayName, email, showEmail, showDm, handleDMUser, userStatus,
	} = props;

	return (
		<div className={styles.userDetailsCard}>
			<div className={styles.userDetailsCardHeader} style={{ backgroundColor: stringToHSL(id) }}>
				<div className={styles.userAvatarBox}>
					<UserAvatar
						id={id}
						src={src}
						displayName={displayName}
						size={155}
						style={
							{ fontSize: 55 }
						}
					/>
				</div>
			</div>
			<div className={styles.userDetailsCardBody}>
				{/* <small>NAME</small> */}
				<p className={styles.detailsCardName}>{displayName}</p>
				{showEmail && (
					<>
						{/* <small>EMAIL</small> */}
						<p className={styles.detailsCardEmail}>{email}</p>
					</>
				)}
				<p style={{ marginBottom: 0 }}>
					{userStatus}
				</p>
			</div>
			{handleDMUser && showDm ? (
				<div className={styles.userDetailsCardFooter}>
					<small className={styles.dmDecription}>
						Message @
						{displayName}
					</small>
					<Popconfirm
						title="DM this user?"
						onConfirm={() => handleDMUser(id)}
					>
						<img src={ChatIcon} alt="dm" />
					</Popconfirm>
				</div>
			) : ''}
		</div>
	);
};
