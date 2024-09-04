import React, {
	useCallback, useEffect, useMemo,
	useState,
} from 'react';
import {
	Drawer, Menu, Tooltip, Input,
} from 'antd';
import VirtualList from 'rc-virtual-list';
import {
	SendOutlined, MessageOutlined, SearchOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { ReactComponent as ParticipantsIcon } from '../../assets/icons/Combined-shape-363.svg';
import styles from './users-sidebar.module.css';
import { logger } from '../../libs/utils';

const { SubMenu } = Menu;

export interface UsersSidebarProps {
	sessionData?: any
	channelUsersData?: any | null
	currentChannel?: any
	currentWorkspaceBatches?: any
	usersSidebarVisible: boolean
	setUserSidebarVisible: any
	handleDMUser?: (userId: string) => Promise<void>
	getChannelUsersList: (payload: any) => Promise<any>
	getBatchUserIds: (batchIds: string[]) => Promise<any>
}

export const UsersSidebar: React.FunctionComponent<UsersSidebarProps> = (props) => {
	const {
		sessionData,
		channelUsersData, currentChannel, currentWorkspaceBatches, usersSidebarVisible,
		setUserSidebarVisible, handleDMUser, getChannelUsersList, getBatchUserIds,
	} = props;

	const rootSubmenuKeys = ['sub1', 'sub2', 'sub4'];

	const [userSearchValue, setUserSearchValue] = useState<string>('');
	const [openKeys, setOpenKeys] = useState<string[]>(['invited']);
	const [batchData, setBatchData] = useState<any>([]);
	const [invitedUsers, setInvitedUsers] = useState<any>();
	const [mentorsUserData, setMentorsData] = useState<any>();
	const [isMentorLoading, setIsMentorLoading] = useState<boolean>(false);
	const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);
	const [isInvitedLoading, setIsInvitedLoading] = useState<boolean>(false);
	const [isRequestingID, setIsRequestingID] = useState<string>('');
	const [channelUserListLength, setChannelUserListLength] = useState<number>(0);

	const onOpenChange = (keys: any) => {
		const latestOpenKey = keys.find((key: any) => openKeys.indexOf(key) === -1);
		if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
			setOpenKeys(keys);
		} else {
			setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
		}
	};

	const onClose = useCallback(() => {
		setUserSidebarVisible(false);
	}, [setUserSidebarVisible]);

	const sortUsersObjByName = useCallback((a: any, b: any) => {
		const firstField = a.displayname.toLowerCase();
		const secondField = b.displayname.toLowerCase();
		if (firstField < secondField) {
			return -1;
		}
		if (firstField > secondField) {
			return 1;
		}
		return 0;
	}, []);

	useEffect(() => {
		// mentors filter
		if (usersSidebarVisible) {
			setIsMentorLoading(true);
			setIsBatchLoading(true);
			setIsInvitedLoading(true);
			(async () => {
				if (!(currentChannel && currentChannel.id)) return;
				setIsRequestingID(currentChannel.id);
				logger.log('load sidebar user..', currentChannel && currentChannel.id);
				const usersData = await getChannelUsersList({ channelId: currentChannel.id });
				const channelUsersDataCopy = { ...usersData };
				setChannelUserListLength(Object.values(usersData).length);
				const currentChannelBatchesData: any = [];
				let mentorsArray: any = [];
				if (channelUsersDataCopy) {
					mentorsArray = Object.values(channelUsersDataCopy);
					mentorsArray = mentorsArray.filter((val: any) => val.role === '2');
					mentorsArray.sort(sortUsersObjByName);
					mentorsArray.forEach((val: any) => {
						delete channelUsersDataCopy[val._id];
					});
				}
				setMentorsData(mentorsArray);
				setIsMentorLoading(false);
				// mentors filter
				// batch filter
				const batchIds = currentChannel.batch_ids || [];
				if (batchIds.length) {
					const batchesArr = await getBatchUserIds(batchIds) || [];
					batchesArr?.map((batchObj: any) => {
						let foundBatch = currentWorkspaceBatches.find((x: any) => x._id === batchObj._id);
						const batchContent: any = [];
						batchObj?.batchContent?.map((uId: string) => {
							if (channelUsersDataCopy[uId]) {
								batchContent.push(channelUsersDataCopy[uId]);
								delete channelUsersDataCopy[uId];
							}
							return uId;
						});
						batchContent.sort(sortUsersObjByName);
						foundBatch = { ...foundBatch, batchContent };
						currentChannelBatchesData.push(foundBatch);
						return batchObj;
					});
				}
				setBatchData(currentChannelBatchesData);
				setIsBatchLoading(false);
				// currentChannel?.batch_ids.forEach((id: string) => {
				// 	let foundBatch = currentWorkspaceBatches.find((x: any) => x._id === id);
				// 	const batchContent: any = [];
				// 	foundBatch?.batchContent?.forEach((val: any) => {
				// 		if (channelUsersDataCopy[val]) {
				// 			batchContent.push(channelUsersDataCopy[val]);
				// 			delete channelUsersDataCopy[val];
				// 		}
				// 		batchContent.sort(sortUsersObjByName);
				// 	});
				// 	foundBatch = { ...foundBatch, batchContent };
				// 	currentChannelBatchesData.push(foundBatch);
				// });
				// setBatchData(currentChannelBatchesData);
				// batch filter

				// invite filter
				setInvitedUsers(Object.values(channelUsersDataCopy));
				setIsInvitedLoading(false);
				// invite filter
			})();
		}
	}, [channelUsersData, currentChannel, currentWorkspaceBatches,
		sortUsersObjByName, getChannelUsersList, getBatchUserIds, usersSidebarVisible, isRequestingID]);

	const searchBatch = useMemo(() => {
		if (userSearchValue.trim()) {
			return batchData.map((batch: any) => {
				const filteredUsers = batch.batchContent.filter(
					(user: any) => user.displayname.toLowerCase().includes(
						userSearchValue.trim().toLowerCase(),
					),
				);

				return { ...batch, batchContent: filteredUsers };
			});
		}
		return batchData;
	}, [batchData, userSearchValue]);

	const filteredMentors = useMemo(() => {
		if (userSearchValue.trim()) {
			return mentorsUserData.filter(
				(user: any) => user.displayname.toLowerCase().includes(
					userSearchValue.trim().toLowerCase(),
				),
			);
		}
		return mentorsUserData;
	}, [mentorsUserData, userSearchValue]);

	const filteredInvitedUsers = useMemo(() => {
		if (userSearchValue.trim()) {
			return invitedUsers.filter(
				(user: any) => user.displayname.toLowerCase().includes(
					userSearchValue.trim().toLowerCase(),
				),
			);
		}
		return invitedUsers;
	}, [invitedUsers, userSearchValue]);

	return (
		<div>
			<Drawer
				className={styles.usersSidebarContainer}
				width={400}
				title={currentChannel?.user_ids?.length ? (
					<div className={styles.userSidebarTitleContainer}>
						<ParticipantsIcon />
						Participants
						{' '}
						{sessionData.role !== '1' && `(${channelUserListLength})`}
					</div>
				) : ''}
				placement="right"
				onClose={onClose}
				visible={usersSidebarVisible}
				bodyStyle={{
					padding: '0',
				}}
			>
				<div className={styles.userSearchInput}>
					<span className={styles.searchPlaceholder}>
						<SearchOutlined />
					</span>
					<Input
						placeholder="Search user"
						onChange={(e: any) => setUserSearchValue(e.target.value)}
					/>
				</div>
				<Menu mode="inline" defaultOpenKeys={['invited']} openKeys={openKeys} onOpenChange={onOpenChange}>
					{/* {filteredMentors
						&& (
							<SubMenu key="MentorList" title={isMentorLoading ? <LoadingOutlined /> :
							 `Mentors (${filteredMentors ? filteredMentors?.length : '0'})`}>
								<VirtualList
									data={filteredMentors}
									height={300}
									itemHeight={34}
									itemKey="_id"
								>
									{(item: any) => item._id && (
										<Menu.Item key={item._id} disabled>
											<div className={styles.sideBarUserItem}>
												<Tooltip placement="left"
													destroyTooltipOnHide={true || undefined}
													title={sessionData.role !== '1' && item?.email}>
													<span>{item.displayname}</span>
												</Tooltip>
												{handleDMUser && item._id !== sessionData?.userId ? (
													<Tooltip placement="top" title="DM user">
														<MessageOutlined
															onClick={() => {
																handleDMUser(item._id);
																setUserSidebarVisible(false);
															}}
														/>
													</Tooltip>
												) : ''}
											</div>
										</Menu.Item>
									)}
								</VirtualList>
							</SubMenu>
						)}
					only visible to admins */}

					{sessionData?.role !== '1' && searchBatch?.map((batch: any) => (
						batch
						&& (
							<SubMenu key={batch?._id} title={isBatchLoading ? <LoadingOutlined /> : `${batch?.title} (${batch?.batchContent ? batch?.batchContent?.length : '0'})`}>
								<VirtualList
									data={batch.batchContent}
									height={300}
									itemHeight={34}
									itemKey="_id"
								>
									{(item: any) => item._id && (
										<Menu.Item key={item._id} disabled>
											<div className={styles.sideBarUserItem}>
												<Tooltip placement="left" destroyTooltipOnHide={true || undefined} title={sessionData.role !== '1' && item?.email}>
													<span>{item.displayname}</span>
												</Tooltip>
												{handleDMUser && item._id !== sessionData?.userId ? (
													<Tooltip placement="left" title={item.email}>
														<MessageOutlined
															onClick={() => {
																handleDMUser(item._id);
																setUserSidebarVisible(false);
															}}
														/>
													</Tooltip>
												) : ''}
											</div>
										</Menu.Item>
									)}
								</VirtualList>
							</SubMenu>
						)
					))}

					{sessionData?.role !== '1' ? (
						<SubMenu key="invited" title={isInvitedLoading ? <LoadingOutlined /> : `Invited (${filteredInvitedUsers && Object.keys(filteredInvitedUsers).length})`}>
							<VirtualList
								data={filteredInvitedUsers}
								height={300}
								itemHeight={34}
								itemKey="_id"
							>
								{(item: any) => item._id && (
									<Menu.Item key={item._id} disabled>
										<div className={styles.sideBarUserItem}>
											<Tooltip placement="left" destroyTooltipOnHide={true || undefined} title={sessionData.role !== '1' && item?.email}>
												<span>{item.displayname}</span>
											</Tooltip>
											{handleDMUser && item._id !== sessionData?.userId ? (
												<Tooltip placement="left" title={item.email}>
													<MessageOutlined
														onClick={() => {
															handleDMUser(item._id);
															setUserSidebarVisible(false);
														}}
													/>
												</Tooltip>
											) : ''}
										</div>
									</Menu.Item>
								)}
							</VirtualList>
						</SubMenu>
					) : ''}

				</Menu>
			</Drawer>
		</div>
	);
};
