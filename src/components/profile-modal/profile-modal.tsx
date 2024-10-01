import React, {
    useCallback, useEffect, useRef, useState,
} from 'react';
import { PlusOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import {
    Avatar, Form, Image, Input, Modal, Upload, message,
    Layout, FormInstance, Popconfirm, Collapse, CollapseProps, Col,
} from 'antd';

import { UploadFile } from 'antd/lib/upload/interface';
import style from './profile-modal.module.css';
import { getBase64 } from '../../libs/utils';

interface ProfileData {
    email: string,
    displayname: string,
    profilePic?: string,
    description?: string,
    password?: string,
    status?: string,
}

interface ProfileModalProps {
    visible: boolean,
    profileData: ProfileData,
    isEditable: boolean,
    profileUploadURL: string,
    setProfile: (profileData: { [key: string]: string }) => Promise<void>,
    closeModal: () => void,
}
type ProfileDeleteResolver = (data: boolean) => void;

export const ProfileModal = (props: ProfileModalProps) => {
    const {
        visible, profileData, setProfile, isEditable, profileUploadURL, closeModal,
    } = props;
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [openPreview, setOpenPreview] = useState<boolean>(false);
    const [fileList, setFileList] = useState<Array<UploadFile<any>>>([]);
    const formRef = useRef<FormInstance>(null);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
    const [activeCollapseList, setActiveCollapseList] = useState<Array<string>>([]);

    const passwordInputRef = useRef<Input>(null);
    const confirmPasswordInputRef = useRef<Input>(null);
    const profileDeleteRequest = useRef< null | ProfileDeleteResolver >(null);

    const handleClose = useCallback(() => {
        setPopupVisible(false);
        setTimeout(closeModal, 50);
    }, [setPopupVisible, closeModal]);

    useEffect(() => {
        if (formRef.current) {
            const [firstName, lastName, ...other] = profileData.displayname.split(' ');
            const finalLastName = [lastName, ...other].join(' ');
            const finalFirstName = firstName.trim();
            const status = profileData?.status || 'Hey! I am using Workspace';
            console.log(profileData.profilePic);
            formRef.current.setFields([
                {
                    name: 'firstName',
                    value: finalFirstName,
                    touched: true,
                }, {
                    name: 'lastName',
                    value: finalLastName,
                }, {
                    name: 'status',
                    value: status,
                }, {
                    name: 'oldPassword',
                    value: '',
                }, {
                    name: 'password',
                    value: '',
                },
            ]);

            if (profileData.profilePic) {
                setFileList([{
                    name: 'profile',
                    url: profileData.profilePic,
                    thumbUrl: profileData.profilePic,
                    uid: '-1',
                }]);
            } else {
                setFileList([]);
            }
        }
    }, [profileData, visible]);

    const handleFormSubmit = useCallback(async (formData: any) => {
        try {
            const dataToSend: { [key: string]: string } = {};
            if (formData.profile_pic) {
                const profilePicURL = formData?.profile_pic?.file?.xhr?.response;
                dataToSend.profilePic = profilePicURL;
            }
            dataToSend.username = `${formData.firstName ?? ''} ${formData.lastName ?? ''}`;
            dataToSend.username = dataToSend.username.trim();
            if (!formData.firstName) {
                throw new Error('Please Provide First Name');
            }
            dataToSend.password = formData.password;
            if (dataToSend.password) {
                if (!formData.oldPassword) {
                    throw new Error('Please provide old password!');
                }
                dataToSend.oldPassword = formData.oldPassword;
            }
            dataToSend.status = formData.status;
            if (dataToSend.status && dataToSend.status.length > 100) {
                throw new Error('Status must be within 100 characters');
            }
            await setProfile(dataToSend);
            message.success('Profile Updated');
            handleClose();
        } catch (error: any) {
            console.error(error);
            message.error(error?.message ?? error);
        }
    }, [setProfile, handleClose]);
    const beforeUpload = useCallback((file: File) => {
        if (loading) {
            return false;
        }
        const isImage = new RegExp('image/*').test(file.type);
        if (!isImage) {
            message.error('Only image is supported in profile picture');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('You can upload image upto 5MB only!');
            return false;
        }
        return true;
    }, [loading]);

    const handlePreview = useCallback(async (file: UploadFile<any>) => {
        if (!file.url && !file.preview) {
            // eslint-disable-next-line no-param-reassign
            file.preview = await getBase64(file.originFileObj as File);
        }
        setPreviewImage(file.url ?? file.preview ?? '');
        setOpenPreview(true);
    }, [setPreviewImage, setOpenPreview]);

    useEffect(() => {
        if (!visible) {
            setPopupVisible(false);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            width={500}
            onOk={() => {
                formRef.current?.submit();
            }}
            onCancel={handleClose}
        >
            <Form
                layout="vertical"
                ref={formRef}
                onFinish={handleFormSubmit}
            >
                <Layout
                    style={{ height: '160px', backgroundColor: 'transparent', marginBottom: '0px' }}
                >
                    <Layout.Sider
                        width="35%"
                        style={{
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Popconfirm
                            visible={popupVisible && visible}
                            title="Want to delete profile?"
                            onConfirm={() => {
                                if (profileDeleteRequest.current) {
                                    profileDeleteRequest.current(true);
                                }
                                setPopupVisible(false);
                            }}
                            onCancel={() => {
                                if (profileDeleteRequest.current) {
                                    profileDeleteRequest.current(false);
                                }
                                setPopupVisible(false);
                            }}
                        >
                            <Form.Item
                                name="profile_pic"
                            >
                                <Upload
                                    accept=".jpeg, .png, .gif, .jpg"
                                    beforeUpload={beforeUpload}
                                    action={profileUploadURL}
                                    withCredentials
                                    fileList={fileList}
                                    listType="picture-card"
                                    onPreview={handlePreview}
                                    onRemove={(file) => {
                                        setPopupVisible(true);
                                        return new Promise((resolve, reject) => {
                                            profileDeleteRequest.current = (data: boolean) => {
                                                resolve(data);
                                            };
                                        });
                                    }}
                                    onDrop={(ev) => {
                                        ev.preventDefault();
                                    }}
                                    className={style.avatarUpload}
                                    style={{
                                        aspectRatio: '1/1',
                                    }}
                                    onChange={(files) => {
                                        setFileList(files.fileList);
                                    }}
                                >
                                    {fileList.length === 0
                                    && (
                                        <div>
                                            <UserOutlined />
                                            Upload
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Popconfirm>
                    </Layout.Sider>
                    <Layout
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            normalize={(value, prevValue, allvalue) => value.trim()}
                            rules={[
                                { required: true, whitespace: true },
                            ]}
                        >
                            <Input
                                type="text"
                                onChange={(ev) => {
                                    // eslint-disable-next-line no-param-reassign
                                    ev.target.value = ev.target.value.trim();
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            normalize={(value, prevValue, allvalue) => value.trim()}
                        >
                            <Input type="text" />
                        </Form.Item>
                    </Layout>
                </Layout>
                <Layout
                    style={{ backgroundColor: 'transparent' }}
                >
                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Input type="text" />
                    </Form.Item>
                </Layout>
                <Collapse
                    bordered={false}
                    activeKey={activeCollapseList}
                    onChange={(keys) => {
                        if (
                            (typeof keys === 'string' && keys === '1')
                            || keys.includes('1')) {
                                setShowPasswordChange(true);
                        } else {
                            setTimeout(() => setShowPasswordChange(false));
                        }
                        if (typeof keys === 'string') {
                            setActiveCollapseList([keys]);
                            return;
                        }
                        setActiveCollapseList(keys);
                    }}
                >
                    <Collapse.Panel
                        key="1"
                        header="Change Password"
                    >
                    {showPasswordChange
                        && (
                            <>
                                <Form.Item
                                    label="Confirm Password"
                                    name="oldPassword"
                                    rules={[
                                        { required: true, message: 'Please enter old password!' },
                                    ]}
                                >
                                    <Input.Password ref={confirmPasswordInputRef} />
                                </Form.Item>
                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{
                                        required: true, whitespace: true, message: 'Please enter password!',
                                    }, {
                                        min: 8, max: 32, message: 'Your password must be at least 8 characters and max, 32 characters long.',
                                    }, {
                                        pattern: new RegExp(/[A-Z]/),
                                        message: 'At least one capital letter required.',
                                    }, {
                                        pattern: new RegExp(/[a-z]/),
                                        message: 'At least one small letter required.',
                                    }, {
                                        pattern: new RegExp(/[0-9]/),
                                        message: 'At least one number required.',
                                    }, {
                                        pattern: new RegExp(/^\S+$/),
                                        message: 'Space is not allowed in password.',
                                    }, {
                                        pattern: new RegExp(/[!/@;<#$%^&>?/?>.,\\|{}[\]_-]/),
                                        message: 'At least one special character required.',
                                    }]}
                                >
                                    <Input.Password ref={passwordInputRef} />
                                </Form.Item>
                            </>
                        )}
                    </Collapse.Panel>

                </Collapse>
            </Form>
            {previewImage && (
                <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                    visible: openPreview,
                    onVisibleChange: (isVisible) => setOpenPreview(isVisible),
                }}
                src={previewImage}
                />
            )}
        </Modal>
    );
};
