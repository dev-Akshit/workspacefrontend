import {
	Button, Form, Input, message,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useLocation } from 'react-router';
import style from './signup.module.css';
import { AppState, useAppStore } from '../../../stores';
import { AuthModal } from '../../../components/authModal';

const appStoreSelector = (state: AppState) => ({
	singupRequest: state.signup,
});

export const Signup:React.FunctionComponent = () => {
	const { singupRequest } = useAppStore(appStoreSelector);
	const [loading, setLoading] = useState(false);
	const history = useHistory();
	const location = useLocation();

	const handleSignupFormSubmit = useCallback(async (values) => {
		try {
			console.log(values);
			setLoading(true);
			const result = new URLSearchParams(location.search);
			const currentToken = result?.get('token');
			const data = {
				...values,
				referToken: currentToken,
			};
			await singupRequest(data);
			message.success('Check your email to complete the verification of your account.');
			history.replace('/login');
		} catch (error: any) {
			message.error(error?.message ?? 'Something went wrong try again.');
		}
		setLoading(false);
		console.log('Singup the user');
	}, [history, singupRequest, location]);

	return (
		<AuthModal title="Create New Account">
			<Form
				layout="vertical"
				onFinish={handleSignupFormSubmit}
			>
				<div className={style.mainBody}>
					<Form.Item
						label="Email"
						name="email"
						requiredMark="optional"
						rules={[{
							required: true, whitespace: true, message: 'Please enter email!',
						}, {
							type: 'email', message: 'Please enter valid email',
						}]}
						normalize={(value, prevVal, prevVals) => value.trim()}
					>
						<Input placeholder="Enter you email" />
					</Form.Item>
					<Form.Item
						label="Full Name"
						name="name"
						requiredMark="optional"
						rules={[{
							required: true, message: 'Please enter name!',
						}]}
					>
						<Input placeholder="Enter your name" />
					</Form.Item>
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
								className={style.signupButton}
							>
								Sign Up
							</Button>
							<p style={{ marginBottom: '0px' }}>
								Already Have an account?&nbsp;&nbsp;
								<Link to="/login">Login</Link>
							</p>
						</div>
					</Form.Item>
				</div>
			</Form>
		</AuthModal>
	);
};
