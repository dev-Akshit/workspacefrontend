import React, { useCallback, useState } from 'react';
import { CaretDownFilled, CaretUpFilled } from '@ant-design/icons';
import { Select } from 'antd';

import styles from './topbar.module.css';

interface TopbarProps {
	channels: any
	currentChannel: any
	setCurrentChannel: (channelId: string) => Promise<boolean>
}

export const Topbar: React.FC<TopbarProps> = (props) => {
	const {
		channels, currentChannel, setCurrentChannel,
	} = props;

	const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState<boolean>(false);

	const handleChannelSelect = useCallback(async (channelId: string) => {
		await setCurrentChannel(channelId);
	}, [setCurrentChannel]);

	return (
		<div className={styles.topbarWrapper}>
			<div className={styles.channelSelectorContainer}>
				<Select
					placeholder="select workspace..."
					onDropdownVisibleChange={(el) => setWorkspaceDropdownOpen(el)}
					suffixIcon={workspaceDropdownOpen ? (
						<CaretUpFilled
							style={{
								position: 'relative', top: -2, left: -5, fontSize: 16, color: '#de6834',
							}}
						/>
					) : (
						<CaretDownFilled
							style={{
								position: 'relative', top: -2, left: -5, fontSize: 16, color: '#de6834',
							}}
						/>
					)}
					style={{ minWidth: 180, maxWidth: '75%' }}
					value={currentChannel?.id}
					onChange={handleChannelSelect}
					options={(
						channels?.map((channel: any) => ({
							label: channel.name,
							value: channel.id,
						}))
					)}
				/>
			</div>
		</div>
	);
};
