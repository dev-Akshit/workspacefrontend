import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Spin } from 'antd';
import { useAppStore } from '../../stores';

export const CustomInviteLinkJoin: React.FunctionComponent = () => {
	const customLinkJoin = useAppStore((state) => state.customLinkJoin);
	const { suffix } = useParams<{ suffix: string }>();
	const history = useHistory();

	useEffect(() => {
		(async () => {
			await customLinkJoin(suffix);
			history.replace('/');
		})();
	}, [history, suffix, customLinkJoin]);

	return <Spin />;
};
