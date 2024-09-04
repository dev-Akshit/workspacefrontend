import React from 'react';

import { ReactComponent as DiscussionDisabled } from '../../../assets/icons/discussion-disabled.svg';

import styles from './disabled.module.css';

export const DisabledScreen: React.FunctionComponent = () => (
	<div className={styles.disabledWrapper}>
		<div className={styles.disabledContainer}>
			<div>
				<DiscussionDisabled />
			</div>
			<div>
				<h3>Discussion Disabled!</h3>
			</div>
			<div>
				<span>Please ask your mentor to enable.</span>
			</div>
		</div>
	</div>
);
