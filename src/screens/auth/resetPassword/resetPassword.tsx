import React, {
	ChangeEvent, ChangeEventHandler, useCallback, useEffect, useState,
} from 'react';
import {
	Button, Form, Input, message,
} from 'antd';
import { useHistory, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { AuthModal } from '../../../components/authModal';
import { AppState, useAppStore } from '../../../stores';
import style from './resetPassword.module.css';

const appStoreSelector = (state: AppState) => ({
	requestValidateResetPasswordToken: state.validatePasswordResetToken,
	requestResetPassword: state.resetPassword,
});
export const ResetPassword = ():JSX.Element => {
	const {
		requestResetPassword,
		requestValidateResetPasswordToken,
	} = useAppStore(appStoreSelector);

	const [loading, setLoading] = useState<boolean>(false);
	const location = useLocation();
	const history = useHistory();
	const [token, setToken] = useState<string>('');

	const checkIfTokenIsValid = useCallback(async (resetPasswordToken: string) => {
		try {
			await requestValidateResetPasswordToken(resetPasswordToken);
			setToken(resetPasswordToken);
		} catch (error: any) {
			console.error(error);
			message.error(error?.message);
			history.replace('/login');
		}
	}, [history, requestValidateResetPasswordToken]);

	const handleResetPasswordRequest = useCallback(async (value: any) => {
		try {
			setLoading(true);
			// eslint-disable-next-line no-param-reassign
			value.token = token;
			await requestResetPassword(value);
			message.success('Password changed successfully.');
			history.replace('/login');
		} catch (error: any) {
			console.error(error);
			message.error(error?.message ?? error);
		}
		setLoading(false);
	}, [history, requestResetPassword, token]);

	useEffect(() => {
		const result = new URLSearchParams(location.search);
		const currentToken = result.get('token');
		if (!currentToken) {
			history.replace('/login');
			message.error('Token not present.');
			return;
		}
		checkIfTokenIsValid(currentToken);
	}, [checkIfTokenIsValid, history, location]);

	return (
		<AuthModal title="Reset Password">
			<Form
				layout="vertical"
				onFinish={handleResetPasswordRequest}
			>
				<div className={style.mainBody}>
					<Form.Item
						label="Password"
						name="password"
						requiredMark="optional"
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
						<Input.Password placeholder="Enter your password" />
					</Form.Item>
					<Form.Item>
						<div className={style.actionButton}>
							<Button
								type="primary"
								size="large"
								htmlType="submit"
								loading={loading}
							>
								Change Password
							</Button>
							<Link to="/login">Login</Link>
						</div>
					</Form.Item>
				</div>
			</Form>
		</AuthModal>
	);
};
