import {
  Button, Dropdown, Menu, Space, Tooltip,
} from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './profile.module.css';
import { ProfileModal } from '../profile-modal';
import { UserAvatar } from '../avatar';

export type ProfileDropdownButtonProperties = {
  sessionData: any;
  logout: () => Promise<void>;
  openProfile?: () => void
};

export const ProfileDropdownButton: React.FC<ProfileDropdownButtonProperties> = function (props) {
  const { sessionData, openProfile, logout } = props;
  const menu = (
    <Menu>
      <Menu.Item onClick={() => openProfile?.()}>
        <div className={styles.menuItemInner}>
          <UserOutlined style={{ fontSize: '16px', color: '#666' }} />
          Profile
        </div>
      </Menu.Item>
      <Menu.Item onClick={() => logout()}>
        <div className={styles.menuItemInner}>
          <LogoutOutlined style={{ fontSize: '16px', color: '#666' }} />
          Logout
        </div>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Dropdown overlay={menu}>
        <Space>
          <Button type="link" className={styles.logout}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <UserAvatar
                displayName={sessionData.displayname}
                id={sessionData.userId}
                src={sessionData.profilePic}
                style={{ position: 'relative', top: '-5px' }}
              />
              <span>{sessionData.displayname}</span>
            </div>
          </Button>
        </Space>
      </Dropdown>
    </>
  );
};
