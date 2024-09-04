import React, { useCallback, useRef, useState } from 'react';
import {
	Button, Form, Input, message,
} from 'antd';
import ReCAPTICHA from 'react-google-recaptcha';

import { Link, useHistory } from 'react-router-dom';
import { APP_CONFIG } from '../../../config';

import { AuthModal } from '../../../components/authModal';
import styles from './forgot.module.css';
import { AppState, useAppStore } from '../../../stores';

const appStoreSelector = (state: AppState) => ({
	requestForgotPassword: state.forgotPassword,
});

export const Forgot = (): JSX.Element => {
	const { requestForgotPassword } = useAppStore(appStoreSelector);
	const history = useHistory();

	const [loading, setLoading] = useState<boolean>(false);
	const googleRecaptchaRef = useRef<ReCAPTICHA | null>(null);

	const handleForgotPasswordRequest = useCallback(async (values: any) => {
		try {
			setLoading(true);
			const reCaptchaValue = googleRecaptchaRef?.current?.getValue();
			if (!reCaptchaValue) {
				throw new Error('Please varify recaptcha first');
			}
			// eslint-disable-next-line no-param-reassign
			values.reCaptcha = reCaptchaValue;
			console.log(values);
			await requestForgotPassword(values);
			history.replace('/login');
			message.success('Please check your email.');
		} catch (error: any) {
			message.error(error?.message);
		} finally {
			googleRecaptchaRef?.current?.reset();
			setLoading(false);
		}
	}, [history, requestForgotPassword]);

	return (
		<AuthModal title="Forgot Password">
			<Form
				layout="vertical"
				className={styles.formOnly}
				onFinish={handleForgotPasswordRequest}
			>
				<Form.Item
					label="Email"
					name="email"
					requiredMark="optional"
					rules={[{
						required: true, whitespace: true, message: 'Please enter email!',
					}, {
						type: 'email', message: 'Please enter valid email',
					}]}
					normalize={(value, prevVal, prevVals) => value.trim().toLowerCase()}
				>
					<Input
						placeholder="Enter you email"
					/>
				</Form.Item>
				<div>
					<ReCAPTICHA
						ref={googleRecaptchaRef}
						sitekey={APP_CONFIG.ReCaptchaSiteKey}
					/>
				</div>
				<Form.Item>
					<div className={styles.actionButton}>
						<Button
							type="primary"
							size="large"
							htmlType="submit"
							loading={loading}
							className={styles.forgotButton}
						>
							Forgot
						</Button>
						<Link to="/login">Login</Link>
					</div>
				</Form.Item>
			</Form>
		</AuthModal>
	);
};
