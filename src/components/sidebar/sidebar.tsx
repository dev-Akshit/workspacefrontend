import React, {
	RefObject,
	useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
	CaretDownFilled, MailOutlined, EditOutlined, CaretUpFilled, SettingOutlined, UserOutlined,
	UpOutlined, DownOutlined, DashOutlined, UserAddOutlined, UsergroupAddOutlined, AlignRightOutlined,
} from '@ant-design/icons';
import {
	Button, Input, Popconfirm, message, Select, Tooltip, Dropdown, Menu, Space, Badge, Modal, Form,
} from 'antd';

import { generatePath, useHistory, useRouteMatch } from 'react-router';
import styles from './sidebar.module.css';
import {
	WorkspaceKind, ChannelKind, channelWritePermissionType, channelWritePermissions,
} from '../../config';
import { UsersSidebar } from '../users-sidebar';

interface SidebarProps {
	isEmbed?: boolean
	isAdmin?: boolean
	sessionData: any
	workspaces: any
	currentWorkspace: any
	channels: any
	dms: any
	currentChannel: any
	channelUsersData: any
	usersSidebarVisible: boolean
	setUserSidebarVisible: any
	isChannelPermissionModalVisible: boolean
	setIsChannelPermissionModalVisible: any
	createWorkspace: (name: string, usersIdsToAdd?: string[]) => Promise<string>
	createChannel: (
		channelName: string, type?: ChannelKind, userIdsToAdd?: string[]
	) => Promise<void | string>
	updateChannelName: (updatedChannelName: string) => Promise<void>
	updateChannelPermission: (channelWritePermissionType: string) => Promise<void>
	setCurrentWorkspace: (workspaceId: string) => Promise<boolean>
	setCurrentChannel: (channelId: string) => Promise<boolean>
	addUserInChannel: (userEmail: string) => Promise<void>
	addBatchInChannel: (batchId: string) => Promise<void>
	handleDMUser?: (userId: string) => Promise<void>
	getChannelUsersList: (payload: any) => Promise<any>
	getBatchUserIds: (batchIds: string[]) => Promise<any>
	leaveChannel: (channelId: string) => Promise<boolean>
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const {
		isEmbed, sessionData,
		workspaces, currentWorkspace,
		channels, dms, currentChannel,
		isAdmin, channelUsersData, setCurrentWorkspace,
		createChannel, setCurrentChannel,
		addUserInChannel, addBatchInChannel,
		updateChannelName,
		updateChannelPermission,
		handleDMUser,
		getChannelUsersList,
		getBatchUserIds,
		usersSidebarVisible,
		setUserSidebarVisible,
		setIsChannelPermissionModalVisible,
		isChannelPermissionModalVisible,
		createWorkspace,
		leaveChannel,
	} = props;

	const [channelName, setChannelName] = useState<string>('');
	const [requestingChannel, setRequestingChannel] = useState<string>('');
	const [updatedChannelName, setUpdateChannelName] = useState<string>('');
	const [userEmail, setUserEmail] = useState<string>('');
	const [batchId, setBatchId] = useState<string | undefined>();
	const [channelPermission, setChannelPermission] = useState<any>();
	const [searchedWorkspace, setSearchedWorkspace] = useState<any>(workspaces);
	const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState<boolean>(false);
	const [batchDropdownOpen, setBatchDropdownOpen] = useState<boolean>(false);
	const [settingDropdownOpen, setSettingDropdownOpen] = useState<boolean>(false);
	const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [isRequesting, setIsRequesting] = useState<boolean>(false);
	const [executing, setExecuting] = useState<boolean>(false);

	const [iscreateChannelModalVisible, setIsCreateChannelModalVisible] = useState(false);
	const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
	const [isEditChannelModalVisible, setIsEditChannelModalVisible] = useState(false);
	const [isAddBatchModalVisible, setIsAddBatchModalVisible] = useState(false);

	const workspaceNameInputRef = useRef<Input | null>(null);

	useEffect(() => {
		setSearchedWorkspace(workspaces);
	}, [workspaces]);

	const handleWorkspaceCreation = useCallback(async () => {
		try {
			if (!workspaceNameInputRef.current) {
				throw new Error('Something went wrong please try again.');
			}
			const workspaceName = workspaceNameInputRef.current?.input.value;
			if (!workspaceName) {
				throw new Error('Please enter workspace name.');
			}
			const workspaceId = await createWorkspace(workspaceName, []);
			workspaceNameInputRef?.current?.setValue('');
			// const workspaceId = await
		} catch (error: any) {
			console.error(error);
			message.error(error?.message ?? error);
		}
	}, [createWorkspace]);

	const handleCreateChannel = useCallback(async () => {
		if (!channelName) {
			message.error('Please enter channel name.');
			return;
		}

		if (requestingChannel !== channelName) {
			setExecuting(true);
			try {
				setIsRequesting(true);
				message.loading({
					content: 'Creating new channel...',
					duration: 0,
					key: 'create-channel',
					type: 'loading',
				});
				setRequestingChannel(channelName);
				await createChannel(channelName);

				message.success('Channel created successfully.');
			} catch (e: any) {
				message.error(e.message);
			} finally {
				setChannelName('');
				setRequestingChannel('');
				setExecuting(false);
				message.destroy('create-channel');
				setIsRequesting(false);
			}
		}
	}, [channelName, createChannel, requestingChannel]);

	const handleUpdateChannelName = useCallback(async () => {
		setIsEditChannelModalVisible(false);
		if (currentChannel.name !== updatedChannelName) {
			try {
				setIsRequesting(true);

				message.loading({
					content: 'Updating channel name...',
					duration: 0,
					key: 'update-channel',
					type: 'loading',
				});

				await updateChannelName(updatedChannelName);

				message.success('Channel name updated successfully.');
				setUpdateChannelName(updatedChannelName);
			} catch (e: any) {
				message.error(e.message);
				setUpdateChannelName(currentChannel?.name);
			} finally {
				message.destroy('update-channel');
				setIsRequesting(false);
			}
		}
	}, [updatedChannelName, updateChannelName, currentChannel]);

	const resetChannelNameInput = useCallback(() => setChannelName(''), []);

	const resetUpdateChannelNameInput = useCallback(() => {
		setUpdateChannelName(currentChannel?.name);
		setIsEditChannelModalVisible(false);
	}, [currentChannel]);

	useEffect(() => {
		setUpdateChannelName(currentChannel?.name);
	}, [currentChannel]);

	const handleAddUserInChannel = useCallback(async () => {
		setIsRequesting(true);
		setIsAddUserModalVisible(false);

		message.loading({
			content: 'Adding user...',
			duration: 0,
			key: 'user-adding-loader',
			type: 'loading',
		});

		try {
			const foundUser = Object.entries(channelUsersData).map((
				[key, value]: any,
			) => value.email === userEmail);
			if (foundUser.includes(true)) {
				message.error('User already added');
				return;
			}

			if (!userEmail || !userEmail.trim()) {
				message.error('Please provide the user\'s email!');
				return;
			}

			const data:any = await addUserInChannel(userEmail);

			message.success(data.msg || 'User added in channel!');
		} catch (e) {
			message.error('User not found');
		} finally {
			setUserEmail('');
			message.destroy('user-adding-loader');
			setIsRequesting(false);
		}
	}, [userEmail, addUserInChannel, channelUsersData]);

	const resetUserEmailInput = useCallback(() => {
		setUserEmail('');
		setIsAddUserModalVisible(false);
	}, []);

	const handleAddBatchInChannel = useCallback(async () => {
		if (!batchId) {
			message.error('Please select a batch to add!');

			return;
		}
		setIsAddBatchModalVisible(false);
		try {
			await addBatchInChannel(batchId);

			message.success('Batch added in channel !');
		} catch (e) {
			message.error('failed!');
		} finally {
			setBatchId(undefined);
		}
	}, [batchId, addBatchInChannel]);

	const handleChannelPermissionChange = useCallback(async () => {
		if (!channelPermission) {
			message.error('Please select channel permission');
			return;
		}
		setIsChannelPermissionModalVisible(false);
		try {
			await updateChannelPermission(channelPermission);

			message.success('Channel permission changed');
		} catch (e) {
			message.error('failed!');
		} finally {
			// setBatchId(undefined);
		}
	}, [channelPermission, updateChannelPermission, setIsChannelPermissionModalVisible]);

	const handleChannelPermissionSelect = useCallback((value) => {
		setChannelPermission(value);
	}, []);

	const resetBatchIdSelect = useCallback(() => {
		setBatchId(undefined);
		setIsAddBatchModalVisible(false);
	}, []);
	const currentChannelPermission = useCallback(() => {
		setIsChannelPermissionModalVisible(false);
		if (currentChannel && currentChannel.write_permission_type) {
			setChannelPermission(`${currentChannel.write_permission_type}`);
		} else {
			setChannelPermission(`${channelWritePermissionType.everyone}`);
		}
	}, [currentChannel, setIsChannelPermissionModalVisible]);

	const handleBatchSelect = useCallback((value) => {
		setBatchId(value);
	}, []);

	const handleWorkspaceChange = useCallback(async (workspaceId: string) => {
		await setCurrentWorkspace(workspaceId);

		setSearchedWorkspace(workspaces);
	}, [workspaces, setCurrentWorkspace, setSearchedWorkspace]);

	const handleChannelClick = useCallback(async (channelId: string) => {
		setExecuting(true);
		try {
			await setCurrentChannel(channelId);
		} finally {
			setExecuting(false);
		}
	}, [setCurrentChannel]);

	const onSearch = (val: string) => {
		const filtered = workspaces.filter((w: any) => (
			w.name.toLowerCase().indexOf(val.toLowerCase()) >= 0
		));
		setSearchedWorkspace(filtered);
	};

	useEffect(() => {
		if (currentWorkspace && currentWorkspace.name) document.title = `${currentWorkspace.name} | CodeQuotient`;
		else document.title = 'Discussion | CodeQuotient';
	}, [currentWorkspace]);

	useEffect(() => {
		if (currentChannel && currentChannel.write_permission_type) {
			setChannelPermission(`${currentChannel.write_permission_type}`);
		} else {
			setChannelPermission(`${channelWritePermissionType.everyone}`);
		}
	}, [setChannelPermission, currentChannel]);

	const menu = useCallback((isAdminOfChannel, channelId) => (
		<Menu style={{ width: '120px' }}>
			{isAdminOfChannel
				&& (
					<>
						<Menu.Item key="edit" onClick={() => setIsEditChannelModalVisible(true)}>
							Edit
						</Menu.Item>
						<Menu.Item key="addUser" onClick={() => setIsAddUserModalVisible(true)}>
							Add User
						</Menu.Item>
					</>
				)}

			{!isAdminOfChannel
				&& (
					<Menu.Item key="leave" onClick={() => leaveChannel(channelId)}>
						Leave Channel
					</Menu.Item>
				)}
		</Menu>
	), [leaveChannel]);

	return (
		<div className={`${styles.sidebarWrapper} ${isEmbed ? styles.embedSidebar : ''}`}>
			<UsersSidebar
				sessionData={sessionData}
				channelUsersData={channelUsersData}
				currentChannel={currentChannel}
				currentWorkspaceBatches={currentWorkspace?.batches}
				usersSidebarVisible={usersSidebarVisible}
				setUserSidebarVisible={setUserSidebarVisible}
				handleDMUser={handleDMUser}
				getChannelUsersList={getChannelUsersList}
				getBatchUserIds={getBatchUserIds}
			/>
			<div className={styles.sidebarMain}>
				{
					!isEmbed && (
						<div className={styles.workspaceSelectorContainer}>
							<Select
								showSearch
								onDropdownVisibleChange={(el) => setWorkspaceDropdownOpen(el)}
								onSearch={onSearch}
								filterOption={false}
								onSelect={() => setSearchedWorkspace(workspaces)}
								style={{ width: 'calc(250px - 1rem)' }}
								placeholder="select discussion..."
								suffixIcon={workspaceDropdownOpen ? (
									<CaretUpFilled
										style={{
											position: 'relative', top: -2.5, left: -8, fontSize: 16, color: '#de6834',
										}}
									/>
								) : (
									<CaretDownFilled
										style={{
											position: 'relative', top: -2.5, left: -8, fontSize: 16, color: '#de6834',
										}}
									/>
								)}
								size="large"
								value={currentWorkspace?.id}
								onChange={handleWorkspaceChange}
								options={(
									searchedWorkspace?.map((workspace: any) => ({
										label: workspace.name,
										value: workspace.id,
									}))
								)}
							/>
						</div>
					)
				}
				{
					currentWorkspace && !!channels?.length && (
						<div className={styles.channelsListContainer}>
							<div>
								<h3>Channels</h3>
								<span>{`(${channels?.length || 0})`}</span>
							</div>
							<div className={styles.channelsListWrapper}>
								{
									channels?.map((channel: any, index: number) => (
										<Button
											className={currentChannel?.id === channel.id ? styles.active : ''}
											style={{ fontWeight: (channel.totalMsgCount - channel.total_read) > 0 ? 700 : 'normal' }}
											type="text"
											key={channel.id}
											disabled={executing}
											onClick={() => handleChannelClick(channel.id)}
										>
											<div className={styles.channelNameContainer}>
												<Tooltip title={channel.name ?? `channel-${index}`}>
													<span className={styles.channelName}>
														{channel.name ?? `channel-${index}`}
													</span>
												</Tooltip>
												&nbsp;
												{
													(channel.totalMsgCount - channel.total_read) >= 0 && (
														<Badge
															style={{ backgroundColor: '#de6834' }}
															overflowCount={9}
															count={channel.totalMsgCount - channel.total_read}
														/>
													)
												}
											</div>
											<div className={styles.channelEditContainer}>
												<Dropdown overlay={menu(isAdmin, channel.id)} placement="bottomRight">
													<Space>
														<span style={{
															position: 'relative',
															top: '-.05rem',
															cursor: 'pointer',
															color: '#9F9F9F',
														}}
														>
															•••
														</span>
													</Space>
												</Dropdown>
												{isAdmin && currentChannel?.id === channel.id && (
													<>

														<Modal
															title="EDIT CHANNEL"
															visible={isEditChannelModalVisible}
															onOk={handleUpdateChannelName}
															onCancel={resetUpdateChannelNameInput}
														>
															<Form.Item
																label={(
																	<>
																		<span style={{ color: 'red', marginRight: '.2rem' }}>*</span>
																		<span>Channel Name</span>
																	</>
																)}
															>
																<Input
																	placeholder="Enter channel name"
																	value={updatedChannelName}
																	defaultValue={currentChannel?.name}
																	prefix="#"
																	onChange={(e) => {
																		setUpdateChannelName(e.target.value.slice(0, 30));
																	}}
																/>
															</Form.Item>
														</Modal>

														<Modal
															title={(
																<>
																	ADD USER
																	<br />
																	<small>You can add a user with their email.</small>
																</>
															)}
															visible={isAddUserModalVisible}
															onOk={handleAddUserInChannel}
															onCancel={resetUserEmailInput}
														>
															<Form.Item
																label={(
																	<>
																		<span style={{ color: 'red', marginRight: '.2rem' }}>*</span>
																		<span>Email</span>
																	</>
																)}
															>
																<Input
																	placeholder="john@example.com"
																	value={userEmail}
																	type="email"
																	onChange={(e) => setUserEmail(e.target.value)}
																/>
															</Form.Item>
														</Modal>

														<Modal
															title={(
																<>
																	ADD BATCH
																	<br />
																	<small>You can add users with their batch.</small>
																</>
															)}
															visible={isAddBatchModalVisible}
															onOk={handleAddBatchInChannel}
															onCancel={resetBatchIdSelect}
														>
															<Form.Item
																label={(
																	<>
																		<span style={{ color: 'red', marginRight: '.2rem' }}>*</span>
																		<span>Batch</span>
																	</>
																)}
															>
																<Select
																	onDropdownVisibleChange={(el) => setBatchDropdownOpen(el)}
																	suffixIcon={batchDropdownOpen ? (
																		<UpOutlined
																			style={{
																				position: 'relative', top: -2.5, left: -8, fontSize: 16,
																			}}
																		/>
																	) : (
																		<DownOutlined
																			style={{
																				position: 'relative', top: -2.5, left: -8, fontSize: 16,
																			}}
																		/>
																	)}
																	style={{ maxWidth: 250, minWidth: 150 }}
																	placeholder="select a batch..."
																	value={batchId}
																	onChange={handleBatchSelect}
																	options={currentWorkspace.batches?.filter(
																		(
																			batch: any,
																		) => !currentChannel?.batch_ids?.includes(batch._id),
																	).map((batch: any) => ({
																		label: batch.title,
																		value: batch._id,
																	}))}
																/>
															</Form.Item>
														</Modal>

														<Modal
															title={(
																<>
																	CHANNEL PERMISSION
																	<br />
																	<small>
																		Use permissions to customize who can do what in this channel.
																	</small>
																</>
															)}
															visible={isChannelPermissionModalVisible}
															onOk={handleChannelPermissionChange}
															onCancel={currentChannelPermission}
														>
															<p style={{ marginBottom: 0, color: '#333', fontSize: 'medium' }}>Send Messages</p>
															<span style={{ color: '#333', fontSize: 'small' }}>
																Allows members to send message in this channel.
															</span>
															<br />
															<Select
																onDropdownVisibleChange={(el) => setSettingDropdownOpen(el)}
																suffixIcon={settingDropdownOpen ? (
																	<UpOutlined
																		style={{
																			position: 'relative', top: -2.5, left: -8, fontSize: 16,
																		}}
																	/>
																) : (
																	<DownOutlined
																		style={{
																			position: 'relative', top: -2.5, left: -8, fontSize: 16,
																		}}
																	/>
																)}
																style={{ maxWidth: 300, minWidth: 180, marginTop: '.5rem' }}
																placeholder="Write permission"
																value={channelPermission}
																onChange={handleChannelPermissionSelect}
																options={
																	Object.entries(channelWritePermissions).map((
																		[key, value]: any,
																	) => ({
																		label: value,
																		value: key,
																	}))
																}
															/>
														</Modal>
														{/* <Popconfirm
															title={(
																<Input
																	placeholder="enter channel name"
																	value={updatedChannelName}
																	defaultValue={currentChannel?.name}
																	prefix="#"
																	onChange={(e) => setUpdateChannelName(e.target.value)}
																/>
															)}
															icon={null}
															placement="right"
															onConfirm={handleUpdateChannelName}
															onCancel={resetUpdateChannelNameInput}
															getPopupContainer={
																(trigger) => trigger.parentElement
																	?.parentElement
																	?.parentElement
																	?.parentElement
																	|| document.body
															}
														>
															<Tooltip title="Edit channel name">
																<EditOutlined />
															</Tooltip>
														</Popconfirm> */}

														{/* <Popconfirm
															title={(
																<div>
																	<p>
																		Channel Access
																	</p>
																	<Select
																		onDropdownVisibleChange={(el) => setSettingDropdownOpen(el)}
																		suffixIcon={settingDropdownOpen ? (
																			<UpOutlined
																				style={{
																					position: 'relative', top: -2.5, left: -8, fontSize: 16,
																				}}
																			/>
																		) : (
																			<DownOutlined
																				style={{
																					position: 'relative', top: -2.5, left: -8, fontSize: 16,
																				}}
																			/>
																		)}
																		style={{ maxWidth: 250, minWidth: 150 }}
																		placeholder="Write permission"
																		value={channelPermission}
																		onChange={handleChannelPermissionSelect}
																		options={
																			Object.entries(channelWritePermissions).map((
																				[key, value]: any,
																			) => ({
																				label: value,
																				value: key,
																			}))
																		}
																	/>
																</div>
															)}
															icon={null}
															placement="right"
															onConfirm={handleChannelPermissionChange}
															onCancel={currentChannelPermission}
															getPopupContainer={
																(trigger) => trigger.parentElement
																	?.parentElement
																	?.parentElement
																	?.parentElement
																	|| document.body
															}
															onVisibleChange={currentChannelPermission}
														>
															<Tooltip title="Channel settings">
																<SettingOutlined style={{ marginLeft: '5px' }} />
															</Tooltip>
														</Popconfirm> */}
													</>
												)}

												{false && sessionData?.role !== '1' ? (
													<Tooltip title="Participants list">
														<UserOutlined style={{ marginLeft: '5px' }} />
													</Tooltip>
												) : ''}

												{false && currentChannel && isAdmin && (
													<>
														<Popconfirm
															title={(
																<Input
																	placeholder="enter user email"
																	value={userEmail}
																	prefix={<MailOutlined />}
																	type="email"
																	onChange={(e) => setUserEmail(e.target.value)}
																/>
															)}
															icon={null}
															placement="right"
															onConfirm={handleAddUserInChannel}
															onCancel={resetUserEmailInput}
															getPopupContainer={
																(trigger) => trigger.parentElement
																	?.parentElement
																	?.parentElement
																	?.parentElement
																	|| document.body
															}
														>
															<Tooltip title="Add user to channel">
																<UserAddOutlined style={{ marginLeft: '5px' }} />
															</Tooltip>
														</Popconfirm>
														{currentWorkspace.type === WorkspaceKind.Course && (
															<Popconfirm
																title={(
																	<div>
																		<Select
																			onDropdownVisibleChange={(el) => setBatchDropdownOpen(el)}
																			suffixIcon={batchDropdownOpen ? (
																				<UpOutlined
																					style={{
																						position: 'relative', top: -2.5, left: -8, fontSize: 16,
																					}}
																				/>
																			) : (
																				<DownOutlined
																					style={{
																						position: 'relative', top: -2.5, left: -8, fontSize: 16,
																					}}
																				/>
																			)}
																			style={{ maxWidth: 150, minWidth: 150 }}
																			placeholder="select a batch..."
																			value={batchId}
																			onChange={handleBatchSelect}
																			options={currentWorkspace.batches?.filter(
																				(
																					batch: any,
																				) => !currentChannel?.batch_ids?.includes(batch._id),
																			).map((batch: any) => ({
																				label: batch.title,
																				value: batch._id,
																			}))}
																		/>
																	</div>
																)}
																icon={null}
																placement="right"
																onConfirm={handleAddBatchInChannel}
																onCancel={resetBatchIdSelect}
																getPopupContainer={
																	(trigger) => trigger.parentElement
																		?.parentElement
																		?.parentElement
																		?.parentElement
																		|| document.body
																}
															>
																<Tooltip title="Add batch to channel">
																	<UsergroupAddOutlined style={{ marginLeft: '5px' }} />
																</Tooltip>
																{' '}

															</Popconfirm>

														)}
													</>

												)}

											</div>

										</Button>
									))
								}
							</div>

							{false
								&& currentChannel && isAdmin && currentChannel.type !== ChannelKind.Private && (
								<div className={styles.channelActions}>
									{/* <div>
											<Popconfirm
												title={(
													<div>
														<Input
															placeholder="enter user email"
															value={userEmail}
															prefix={<MailOutlined />}
															type="email"
															onChange={(e) => setUserEmail(e.target.value)}
														/>
													</div>
												)}
												icon={null}
												placement="right"
												onConfirm={handleAddUserInChannel}
												onCancel={resetUserEmailInput}
												getPopupContainer={(trigger) => trigger.parentElement || document.body}
											>
												<Button type="text">Add user to channel</Button>
											</Popconfirm>
										</div> */}

									{/* {
											currentWorkspace.type === WorkspaceKind.Course && (
												<div>
													<Popconfirm
														title={(
															<div>
																<Select
																	onDropdownVisibleChange={(el) => setBatchDropdownOpen(el)}
																	suffixIcon={batchDropdownOpen ? (
																		<UpOutlined
																			style={{
																				position: 'relative', top: -2.5, left: -8, fontSize: 16,
																			}}
																		/>
																	) : (
																		<DownOutlined
																			style={{
																				position: 'relative', top: -2.5, left: -8, fontSize: 16,
																			}}
																		/>
																	)}
																	style={{ maxWidth: 150, minWidth: 150 }}
																	placeholder="select a batch..."
																	value={batchId}
																	onChange={handleBatchSelect}
																	options={currentWorkspace.batches?.filter(
																		(batch: any) => !currentChannel?.batch_ids?.includes(batch._id),
																	).map((batch: any) => ({
																		label: batch.title,
																		value: batch._id,
																	}))}
																/>
															</div>
														)}
														icon={null}
														placement="right"
														onConfirm={handleAddBatchInChannel}
														onCancel={resetBatchIdSelect}
														getPopupContainer={(trigger) => trigger.parentElement || document.body}
													>
														<Button type="text">Add batch to channel</Button>
													</Popconfirm>
												</div>
											)
										} */}
								</div>
							)}
						</div>
					)
				}

				{
					currentWorkspace && !!dms?.length && (
						<div className={styles.dmsListContainer}>
							<div>
								<h3>DMs</h3>
								<span>{`(${dms?.length || 0})`}</span>
							</div>
							<div className={styles.dmsListWrapper}>
								{
									dms?.map((dm: any, index: number) => (
										<Button
											className={currentChannel?.id === dm.id ? styles.active : ''}
											style={{ fontWeight: (dm.totalMsgCount - dm.total_read) > 0 ? 700 : 'normal' }}
											type="text"
											key={dm.id}
											onClick={() => handleChannelClick(dm.id)}
										>
											<Tooltip title={dm.email}>
												<span>
													{
														dm.name
													}
												</span>
											</Tooltip>
											&nbsp;
											{
												(dm.totalMsgCount - dm.total_read) >= 0 && (
													<Badge
														style={{ backgroundColor: '#de6834' }}
														overflowCount={9}
														count={dm.totalMsgCount - dm.total_read}
													/>
												)
											}
										</Button>
									))
								}
							</div>
						</div>
					)
				}
			</div>
			<div className={styles.sidebarFooter}>
				<div className={styles.workspaceActions}>
					<span className={styles.createWorkspaceActionButton}>
						<Tooltip
							title="Create Workspace"
							placement="topLeft"
						>
							<Popconfirm
								title={(
									<Input
										placeholder="enter workspace name"
										ref={workspaceNameInputRef}
									/>
								)}
								icon={null}
								onConfirm={() => handleWorkspaceCreation()}
								onCancel={() => workspaceNameInputRef?.current?.setValue('')}
							>
								<Button type="text">+</Button>
							</Popconfirm>
						</Tooltip>
					</span>
					<div>
						{
							isAdmin
								&& (
									<Popconfirm
										title={(
											<Input
												placeholder="enter channel name"
												value={channelName}
												prefix="#"
												onChange={(e) => {
													setChannelName(e.target.value.slice(0, 30));
												}}
											/>
										)}
										icon={null}
										placement="topLeft"
										disabled={executing}
										onConfirm={handleCreateChannel}
										onCancel={resetChannelNameInput}
										getPopupContainer={(trigger) => trigger.parentElement || document.body}
									>
										<Button type="text">Start new channel</Button>
									</Popconfirm>
								)
						}
					</div>
				</div>
			</div>
		</div>
	);
};
