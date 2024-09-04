import React, { useCallback } from 'react';
import {
	Switch, Route, Redirect, useHistory, generatePath,
} from 'react-router-dom';

import { WorkspacesMain } from './workspaces-main';

import { AppState, useAppStore } from '../../stores';

const appStoreSelector = (state: AppState) => ({
	readNotification: state.readNotification,
});

export const WorkspacesScreens: React.FunctionComponent = () => {
	const history = useHistory();

	const {
		readNotification,
	} = useAppStore(appStoreSelector);

	const workspacesMain = useCallback(({ match, location }) => {
		const {
			courseId, workspaceId, channelId, messageId,
		} = match?.params;

		const q = new URLSearchParams(location.search);
		const notificationId = q.get('notificationId');
		if (notificationId) {
			readNotification(notificationId);
		}

		const isEmbed = q.has('isEmbed');
		const isSidebarEmbed = q.has('isSidebarEmbed');

		if (isEmbed && isSidebarEmbed) {
			let path = '/';

			if (courseId) {
				path = generatePath('/course/:courseId', {
					courseId,
				});
			}

			if (workspaceId && channelId && messageId) {
				path = generatePath('/workspace/:workspaceId/channel/:channelId/message/:messageId', {
					workspaceId,
					channelId,
					messageId,
				});
			}

			if (workspaceId && channelId) {
				path = generatePath('/workspace/:workspaceId/channel/:channelId', {
					workspaceId,
					channelId,
				});
			}

			if (workspaceId && channelId && messageId) {
				path = generatePath('/workspace/:workspaceId', {
					workspaceId,
				});
			}

			history.replace({
				pathname: path,
				search: '?isSidebarEmbed',
			});
		}

		return (
			<WorkspacesMain
				courseId={courseId}
				workspaceId={workspaceId}
				channelId={channelId}
				messageId={messageId}
				isEmbed={isEmbed}
				isSidebarEmbed={isSidebarEmbed}
			/>
		);
	}, [history, readNotification]);

	return (
		<Switch>
			<Route
				exact
				path="/"
				render={workspacesMain}
			/>

			<Route
				exact
				path="/course/:courseId"
				render={workspacesMain}
			/>

			<Route
				exact
				path="/workspace/:workspaceId"
				render={workspacesMain}
			/>

			<Route
				exact
				path="/workspace/:workspaceId/channel/:channelId"
				render={workspacesMain}
			/>

			<Route
				exact
				path="/workspace/:workspaceId/channel/:channelId/message/:messageId"
				render={workspacesMain}
			/>

			<Redirect to="/error" />
		</Switch>
	);
};
