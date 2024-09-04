import { UploadFile } from 'antd/lib/upload/interface';

import pdfIcon from '../../assets/img/pdf.svg';
import csvIcon from '../../assets/img/csv.svg';
import fileIcon from '../../assets/img/file.svg';
import excelIcon from '../../assets/img/excel.svg';

export const logger = console;

export function getRandomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getLocaleTime(date: Date): string {
	return date.toLocaleTimeString([], {
		hour: '2-digit', minute: '2-digit', hourCycle: 'h12',
	}).split(' ').join('');
}

export function getLocaleDate(date: Date): string {
	return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: '2-digit' });
}

export function getLocaleWeekday(date: Date): string {
	return date.toLocaleDateString([], { weekday: 'short' });
}

export function getDifferenceInDays(d1: Date, d2: Date): number {
	const date1 = new Date(d1);
	const date2 = new Date(d2);

	date1.setHours(0, 0, 0, 0);
	date2.setHours(0, 0, 0, 0);

	const diffTime = Math.abs(date1.valueOf() - date2.valueOf());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
}

export function getMessageTimeString(d: string | number): string {
	const date = new Date(d);

	const diffDays = getDifferenceInDays(date, new Date());
	let dateString = 'Today';
	if (diffDays >= 2) {
		dateString = `${getLocaleWeekday(date)}, ${getLocaleDate(date)}`;
	} else if (diffDays >= 1) {
		dateString = 'Yesterday';
	}

	return `${getLocaleTime(date)} • ${dateString}`;
}

export function getReplyTimeString(d: string | number): string {
	const date = new Date(d);

	const diffDays = getDifferenceInDays(date, new Date());
	let dateString = 'Today';
	if (diffDays >= 2) {
		dateString = `${getLocaleWeekday(date)}, ${getLocaleDate(date)}`;
	} else if (diffDays >= 1) {
		dateString = 'Yesterday';
	}

	return `${getLocaleTime(date)} • ${dateString}`;
}

export function mergeRefs(...refs: any[]): any {
	const filteredRefs = refs.filter(Boolean);

	if (!filteredRefs.length) {
		return null;
	}

	// TODO WHAT IS THIS
	if (filteredRefs.length === 0) {
		return filteredRefs[0];
	}

	return (instance: any) => {
		filteredRefs.forEach((ref: any) => {
			if (typeof ref === 'function') {
				ref(instance);
			} else if (ref) {
				// eslint-disable-next-line no-param-reassign
				ref.current = instance;
			}
		});
	};
}

export function getAttachmentImage(file: { type: string, url: string }) {
	if (file.type.startsWith('image')) {
		return file.url;
	}
	if (file.type === 'application/pdf') {
		return pdfIcon;
	}
	if (file.type === 'text/csv') {
		return csvIcon;
	}
	if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
		return excelIcon;
	}
	return fileIcon;
}

export function getBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
}

export * from './color';
