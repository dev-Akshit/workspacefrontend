import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';

import { ErrorScreens } from './error-screens';
import { WorkspacesScreens } from './workspaces-screens';
import { Login, Signup } from './auth';
import { Forgot } from './auth/forgot';
import { ResetPassword } from './auth/resetPassword';
import { CustomInviteLinkJoin } from './custom-invite-link';

export const MainScreen: React.FunctionComponent = () => (
	<Switch>
		<Route path="/error">
			<ErrorScreens />
		</Route>
		<Route path="/login">
			<Redirect to="/" />
		</Route>
		<Route path="/reset">
			<Redirect to="/" />
		</Route>
		<Route path="/reset/:token">
			<Redirect to="/" />
		</Route>
		<Route path="/signup">
			<Redirect to="/" />
		</Route>
		<Route path="/customLinkChannelJoin/:suffix">
			<CustomInviteLinkJoin />
		</Route>
		<Route path="/">
			<WorkspacesScreens />
		</Route>
		<Redirect to="/error" />
	</Switch>
);

export const AuthScreen: React.FunctionComponent = () => (
	<Switch>
		<Route path="/login">
			<Login />
		</Route>
		<Route path="/signup">
			<Signup />
		</Route>
		<Route path="/resetPassword">
			<ResetPassword />
		</Route>
		<Route path="/forgot">
			<Forgot />
		</Route>
		<Route path="/customLinkChannelJoin">
			<Login />
		</Route>
		<Redirect to="/login" />
	</Switch>
);
