import {
    Button, Form, Input, message, Image, Checkbox,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import style from './login.module.css';
import { AppState, useAppStore } from '../../../stores';
import { AuthModal } from '../../../components/authModal';

const appStoreSelector = (state: AppState) => ({
    loginRequest: state.login,
    newLoginRequest: state.newLogin,
});

export const Login: React.FunctionComponent = () => {
    const { loginRequest, newLoginRequest } = useAppStore(appStoreSelector);
    const [loading, setLoading] = useState<boolean>(false);
    const [showOtpField, setShowOtpField] = useState<boolean>(false);
    const [form] = Form.useForm(); // Form instance to access form values

    const handleLoginFormSubmit = useCallback(async (value: any) => {
        setLoading(true);
        try {
            if (!showOtpField) {
                await loginRequest(value);
                setLoading(false);
            } else {
                await newLoginRequest(value);
                setLoading(false);
            }
        } catch (error: any) {
            if (error.message === 'Already logged in other device. Verify for more sessions') {
                setShowOtpField(true);
                message.info('An OTP has been sent to your email. Please enter it to verify.');
            } else {
                message.error(error?.message ?? error);
            }
            setLoading(false);
        }
    }, [loginRequest, newLoginRequest, showOtpField]);

    return (
        <AuthModal title="Login Into Your Account">
            <>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLoginFormSubmit}
                    className={style.formOnly}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        requiredMark="optional"
                        rules={[
                            { required: true, whitespace: true, message: 'Please enter email!' },
                            { type: 'email', message: 'Please enter valid email' },
                        ]}
                        normalize={(value) => value.trim().toLowerCase()}
                    >
                        <Input placeholder="Enter your email" disabled={showOtpField} />
                    </Form.Item>

                    <div className={style.passwordContainer}>
                        <Form.Item
                            label="Password"
                            name="password"
                            requiredMark="optional"
                            rules={[
                                { required: true, whitespace: true, message: 'Please enter password!' },
                            ]}
                        >
                            <Input.Password placeholder="Enter your password" disabled={showOtpField} />
                        </Form.Item>
                        <div className={style.remeberMeContainer}>
                            <Form.Item
                                name="rememberMe"
                                labelAlign="right"
                                valuePropName="checked"
                            >
                                <Checkbox disabled={showOtpField}>Remember me</Checkbox>
                            </Form.Item>
                            <Link className={style.forgotPasswordLink} to="/forgot">Forgot Password</Link>
                        </div>
                    </div>

                    {/* Conditionally render OTP field */}
                    {showOtpField && (
                        <Form.Item
                            label="OTP"
                            name="otp"
                            requiredMark="optional"
                            rules={[
                                { required: true, message: 'Please enter the OTP!' },
                                { len: 4, message: 'OTP must be 4 digits!' },
                                { pattern: /^\d+$/, message: 'OTP must contain only digits!' },
                            ]}
                        >
                            <Input placeholder="Enter the 4-digit OTP" maxLength={4} />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <div className={style.actionButton}>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={loading}
                                className={style.loginButton}
                            >
                                {showOtpField ? 'Verify OTP' : 'Login'}
                            </Button>
                            <p style={{ marginBottom: '0px' }}>
                                 Dont have an account?
                                <Link to="/signup">SignUp</Link>
                            </p>
                        </div>
                    </Form.Item>
                </Form>
            </>
        </AuthModal>
    );
};
