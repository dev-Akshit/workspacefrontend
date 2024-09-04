import React, { useCallback } from 'react';
import {
	Switch, Route, useRouteMatch, Redirect,
} from 'react-router-dom';
import { DisabledScreen } from './disabled';
import { NotFoundScreen } from './not-found';

export const ErrorScreens: React.FunctionComponent = () => {
	const match = useRouteMatch();

	const disabledScreen = useCallback(() => <DisabledScreen />, []);

	const notFoundScreen = useCallback(() => <NotFoundScreen />, []);

	return (
		<Switch>
			<Route
				exact
				path={`${match.url}/disabled`}
				render={disabledScreen}
			/>

			<Route
				exact
				path={`${match.url}/404`}
				render={notFoundScreen}
			/>

			<Redirect to={`${match.url}/404`} />
		</Switch>
	);
};
