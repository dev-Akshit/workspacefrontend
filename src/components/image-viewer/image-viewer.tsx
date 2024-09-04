import React from 'react';
import { Image, ImageProps } from 'antd';

export interface ImageViewerProps extends ImageProps {
	container: React.Ref<HTMLElement>
}

export const ImageViewer: React.FunctionComponent<ImageViewerProps> = (props) => {
	const {
		container,
	} = props;

	return (
		// <Image
		// 	width={200}
		// 	key={attachment.url}
		// 	src={attachment.url}
		// 	alt={attachment.url}
		// 	preview={!isSidebarEmbed}
		// 	onClick={() => {
		// 		if (isSidebarEmbed) {
		// 			window.open(attachment.url, '_blank')?.focus();
		// 		}
		// 	}}
		// 	style={isSidebarEmbed ? { cursor: 'pointer' } : {}}
		// />
		<h1>aaa</h1>
	);
};
