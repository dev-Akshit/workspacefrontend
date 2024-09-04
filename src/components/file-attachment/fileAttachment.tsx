import React, { useMemo } from 'react';
import { Image } from 'antd';
import styles from './fileAttachment.module.css';
import pdf from '../../assets/img/pdf.svg';
import csvFile from '../../assets/img/csv.svg';
import fileIcon from '../../assets/img/file.svg';
import excel from '../../assets/img/excel.svg';

interface pdfProps{
	name: string;
	link: string;
	type: string;
}

export const FileAttachment: React.FunctionComponent<pdfProps> = (props) => {
	const { name, link, type } = props;
	const url = useMemo(() => {
		if (type === 'application/pdf') {
			return pdf;
		}
		if (type === 'text/csv') {
			return csvFile;
		}
		if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			return excel;
		}
		return fileIcon;
	}, [type]);
	return (
		<div>
			<a rel="noreferrer" href={link} download className={styles.pdf_link} target="_blank">
				<div>
					<Image
						width={200}
						key={link}
						src={url}
						alt={link}
						preview={false}
						style={{ cursor: 'pointer' }}
					/>
					<pre>{name}</pre>
				</div>
			</a>
		</div>
	);
};
