import React, {
	useEffect, useLayoutEffect, useMemo, useState,
} from 'react';
import { Spin, message } from 'antd';
import { useHistory } from 'react-router';
import { AuthScreen, MainScreen } from './screens';
import { AppState, useAppStore } from './stores';

import { ReactComponent as Loader } from './assets/icons/loader.svg';

import { logger } from './libs/utils';

import styles from './app.module.css';
import { queryParamsMessageType } from './config';

const appStoreSelector = (state: AppState) => ({
	initialConnectionEstablished: state.initialConnectionEstablished,
	connected: state.connected,
	appLoading: state.appLoading,
	appLoadingText: state.appLoadingText,
	sessionData: state.sessionData,
	init: state.init,
});

export function App(): JSX.Element {
	const history = useHistory();
	const [initialLoadComplete, setInitalLoad] = useState(false);
	const {
		initialConnectionEstablished,
		appLoading,
		appLoadingText,
		sessionData,
		init,
	} = useAppStore(appStoreSelector);

	useEffect(() => {
		(async () => {
			try {
				await init();
			} catch (e: any) {
				console.log(history.location.pathname);
				logger.log(e.message);
			} finally {
				setInitalLoad(true);
			}
		})();
	}, [history, init]);

	useEffect(() => {
		const url = new URL(window.location.href);
		const messageString = url.searchParams.get('message');
		const messageType = url.searchParams.get('messageType');
		if (messageString && messageType) {
			switch (parseInt(messageType, 10)) {
				case queryParamsMessageType.success: {
					message.success(messageString);
					break;
				}
				case queryParamsMessageType.error: {
					message.error(messageString);
					break;
				}
				default: {
					console.error('Invalid message Type', messageType);
				}
			}
		}
		url.searchParams.delete('message');
		url.searchParams.delete('messageType');
		window.history.replaceState({}, '', url.toString());
	});

	return (
		<Spin
			wrapperClassName={styles.wrapper}
			spinning={appLoading || !initialLoadComplete}
			indicator={<Loader />}
			size="large"
			tip={appLoadingText}
		>

			{(sessionData == null && !appLoading && initialLoadComplete)
				? (<AuthScreen />)
				: null}
			{
				initialConnectionEstablished ? (
					<MainScreen />
				) : null
			}
		</Spin>
	);
}
