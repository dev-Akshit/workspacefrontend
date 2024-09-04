import React from 'react';
import { Image } from 'antd';
import style from './authModal.module.css';

interface AuthModalProp {
	children?: JSX.Element;
	title?: string;
}

export const AuthModal = (props: AuthModalProp): JSX.Element => {
	const { children, title } = props;
	return (
		<div className={style.mainBody}>
			<div className={style.formBody}>
				<div className={style.cqLogoContainer}>
					<Image height={40} preview={false} src={`${process.env.PUBLIC_URL}/cq_logo_primary.png`} />
					<h3>{title}</h3>
				</div>
				{children}
			</div>
		</div>
	);
};
