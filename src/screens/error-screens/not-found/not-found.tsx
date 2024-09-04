import React from 'react';

import { ReactComponent as Error404 } from '../../../assets/img/404.svg';

import styles from './not-found.module.css';

export const NotFoundScreen: React.FunctionComponent = () => (
	<div className={styles.notFoundWrapper}>
		<div className={styles.notFoundContainer}>
			<div className={styles.leftPane}>
				<div className={styles.circleArtwork}>
					<div />
					<div />
					<div />
				</div>
				<div className={styles.textContainer}>
					<h1>Uh oh!</h1>
					<p>
						Sorry, it seems we can’t find the page you’re looking for :(
					</p>
					<a href="/">Go back to discussion</a>
				</div>
			</div>
			<div className={styles.rightPane}>
				<Error404 style={{ maxWidth: '100%' }} />
			</div>
		</div>
	</div>
);
