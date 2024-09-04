import React, {
	useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
	Button, Upload, Tooltip, message,
} from 'antd';
import { MentionsInput, Mention, MentionItem } from 'react-mentions';

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import lib, {
	CloseOutlined,
	LoadingOutlined,
	CheckCircleOutlined,
	FileImageOutlined,
	SmileOutlined,
} from '@ant-design/icons';

import { UserAvatar } from '../avatar';

import styles from './message-editor.module.css';
import mentionsStyle from './mentions.module.css';

import { ReactComponent as SendButtonIcon } from '../../assets/icons/send-button-icon.svg';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload-icon.svg';
import { UserRoles, ChannelKind, validAttachments } from '../../config';
import pdf from '../../assets/img/pdf.svg';
import csvFile from '../../assets/img/csv.svg';
import fileIcon from '../../assets/img/file.svg';
import excel from '../../assets/img/excel.svg';
import { getAttachmentImage } from '../../libs/utils';

interface Attachment {
	url: string,
	name?: string,
	mimetype: string
}

interface MessageInputValue {
	value: string
	plainTextValue: string
	mentions: MentionItem[]
	attachments: Attachment[]
}

const defaultMessageInputValue: MessageInputValue = {
	value: '',
	plainTextValue: '',
	mentions: [],
	attachments: [],
};

interface MessageEditorProps {
	isSidebarEmbed?: boolean
	sessionData: any | null
	users: any | null
	editMessageObj: any | null
	editReplyObj: any | null
	isReplyInput?: boolean
	messageEditId?: string | null
	messageReplyId?: string | null
	channelUsers?: string | null
	isDisabled?: boolean
	activeChannelId?: string
	activeChannelType: number | string
	createMessage?: (content: string, mentions: MentionItem[], attachments: any[]) => Promise<void>
	uploadAttachment?: (data: unknown) => Promise<string>
	setMessageEditId: (messageId: string) => void
	setMessageReplyId: (messageId: string) => void
	editMessage?: (content: string, mentions: MentionItem[], attachments: any[]) => Promise<void>
	handleEditReply?: (content: string, mentions: MentionItem[], attachments: any[],
		replytoparentid: string) => Promise<void>
	getUsersListByNamePrefix: (payload: any) => Promise<any>
}

export const MessageEditor: React.FC<MessageEditorProps> = (props) => {
	const {
		isSidebarEmbed,
		sessionData,
		users,
		isReplyInput,
		channelUsers,
		isDisabled,
		createMessage,
		uploadAttachment,
		messageEditId,
		setMessageEditId,
		editMessageObj,
		editMessage,
		setMessageReplyId,
		messageReplyId,
		editReplyObj,
		handleEditReply,
		getUsersListByNamePrefix,
		activeChannelId,
		activeChannelType,
	} = props;

	const messageInputRef = useRef<HTMLTextAreaElement>(null);

	const [mentionSuggestionBoxElement, setMentionSuggestionBoxElement] = useState<Element>();
	const [isEmojiPickerModalVisible, setIsEmojiPickerModalVisible] = useState<boolean>(false);
	const mentionSuggestionsRef = useCallback((node: HTMLDivElement) => {
		if (node) {
			setMentionSuggestionBoxElement(node);
		}
	}, []);

	const usersDataForMentions: any = async (prefix: any = '', callback?: any) => {
		if (!prefix.trim() || activeChannelType === ChannelKind.Private) return {};
		const usersData = await getUsersListByNamePrefix({ channelId: activeChannelId, prefix });
		const usersArr: any[] = [];
		Object.values(usersData).map((user: any) => {
			if (sessionData.userId !== user._id) {
				usersArr.push({
					id: user._id,
					display: user.displayname,
					email: user.email,
				});
			}
			return user;
		});
		if (callback) callback(usersArr);
		return usersArr;
	};

	const mentionsList = useMemo(() => {
		if (users) {
			return Object.values(users).map((user: any) => ({
				id: user._id,
				display: user.displayname,
				email: user.email,
			}));
		}
		return [];
	}, [users]);

	const [
		messageInputValue, setMessageInputValue,
	] = useState<MessageInputValue>(defaultMessageInputValue);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [isPreview, setIsPreview] = useState<boolean>(false);
	const [uploadingImgSrc, setUploadingImgSrc] = useState<string>('');

	useEffect(() => {
		if (editMessageObj) {
			let inputValue = editMessageObj.content;

			if (editMessageObj.mentions && editMessageObj.mentions.length) {
				editMessageObj.mentions.forEach((val: any) => {
					const name = val.display.slice(1);
					inputValue = inputValue.replace(val.display, `@[${name}](${val.id})`);
				});
			}

			if (editMessageObj.attachments?.length) {
				const singleAttachment = editMessageObj.attachments[0];
				const attachmentPreviewURL = getAttachmentImage({
					type: singleAttachment?.mimetype ?? '',
					url: singleAttachment?.url ?? '',
				});
				setUploadingImgSrc(attachmentPreviewURL);
			}

			setMessageInputValue({
				value: inputValue,
				plainTextValue: editMessageObj.content,
				mentions: editMessageObj.mentions,
				attachments: editMessageObj.attachments,
			});
			messageInputRef.current?.focus();
		}

		if (editReplyObj) {
			let inputValue = editReplyObj.content;

			if (editReplyObj.mentions && editReplyObj.mentions.length) {
				editReplyObj.mentions.forEach((val: any) => {
					const name = val.display.slice(1);
					inputValue = inputValue.replace(val.display, `@[${name}](${val.id})`);
				});
			}

			if (editReplyObj.attachments?.length) {
				const singleAttachment = editReplyObj.attachments[0];
				const attachmentPreviewURL = getAttachmentImage({
					type: singleAttachment?.mimetype ?? '',
					url: singleAttachment?.url ?? '',
				});
				setUploadingImgSrc(attachmentPreviewURL);
			}

			setMessageInputValue({
				value: inputValue,
				plainTextValue: editReplyObj.content,
				mentions: editReplyObj.mentions,
				attachments: editReplyObj.attachments,
			});

			messageInputRef.current?.focus();
			setIsEmojiPickerModalVisible(false);
		}
	}, [editMessageObj, editReplyObj]);

	useEffect(() => {
		if (messageInputRef.current) {
			messageInputRef.current.style.height = '1px';
			const height = messageInputRef.current?.scrollHeight;
			messageInputRef.current.style.height = `${Math.min(height, isReplyInput ? 110 : 70)}px`;
		}
	}, [isReplyInput, messageInputValue.plainTextValue, messageInputRef]);

	const handleMessageInputChange = useCallback(
		(_: unknown, newValue: string, newPlainTextValue: string, mentions: MentionItem[]) => {
			setMessageInputValue({
				value: newValue,
				plainTextValue: newPlainTextValue,
				mentions,
				attachments: messageInputValue.attachments,
			});
		}, [messageInputValue],
	);

	const handleIsEmojiPickerModalVisible = useCallback(
		() => {
			setIsEmojiPickerModalVisible(!isEmojiPickerModalVisible);
		}, [isEmojiPickerModalVisible],
	);

	const handleAddEmojiToInput = useCallback(
		(event: EmojiClickData) => {
			setMessageInputValue((prevState) => ({
				...prevState,
				value: prevState.value + event.emoji,
				plainTextValue: prevState.plainTextValue + event.emoji,
			}));
		}, [],
	);

	const handlePostMessage = useCallback(async () => {
		try {
			const { plainTextValue, mentions, attachments } = messageInputValue;
			if (editMessageObj) {
				await editMessage?.(plainTextValue.trim(), mentions, attachments);
				message.success('Message updated');
			} else if (editReplyObj) {
				const { replytoparentid } = editReplyObj;
				await handleEditReply?.(plainTextValue.trim(), mentions, attachments, replytoparentid);
				message.success('Message updated');
			} else {
				await createMessage?.(plainTextValue.trim(), mentions, attachments);
			}
		} catch (e: any) {
			message.error(e?.message || 'Error while sending message.');
		} finally {
			setIsPreview(false);
			setUploadingImgSrc('');
			setMessageInputValue(defaultMessageInputValue);
			setIsEmojiPickerModalVisible(false);
		}
	}, [messageInputValue, createMessage, editMessage, editMessageObj, editReplyObj,
		handleEditReply]);

	const handleRemoveAttachment = useCallback(() => {
		setIsPreview(false);
		setUploadingImgSrc('');
		setMessageInputValue({
			...messageInputValue,
			attachments: [],
		});
	}, [messageInputValue]);

	const handleBeforeAttachmentUpload = useCallback((file: File) => {
		const SIZE_LIMIT = 2 * 1024 * 1024;
		let isValid = false;
		validAttachments.forEach((validAttachment) => {
			if (validAttachment.test(file.type)) {
				isValid = true;
			}
		});
		if (file.size > SIZE_LIMIT) {
			message.error('attachment size cannot exceed 2MB.');
			return false;
		}
		if (!isValid) {
			message.error('This file is not supported');
		}
		return isValid;
	}, []);

	const handleUploadAttachment = useCallback(async ({ onSuccess, onError, file }) => {
		setIsUploading(true);
		setIsPreview(true);
		try {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const src = reader.result as string;
				const attachmentPreviewURL = getAttachmentImage({
					type: file.type,
					url: src,
				});
				setUploadingImgSrc(attachmentPreviewURL);
			};

			const url = await uploadAttachment?.(file);

			if (url) {
				setMessageInputValue({
					...messageInputValue,
					attachments: [{
						url,
						name: file.name,
						mimetype: file.type,
					}],
				});

				onSuccess();

				message.success('Attachment added!');
			} else {
				throw new Error();
			}
		} catch (e: any) {
			message.error(e.message || 'Upload error');

			onError();
		} finally {
			setIsUploading(false);
		}
	}, [messageInputValue, uploadAttachment]);

	const handleMessageEditorContainerClick = useCallback(
		() => messageInputRef.current?.focus(),
		[messageInputRef],
	);

	useEffect(() => {
		setMessageInputValue(defaultMessageInputValue);
	}, [activeChannelId]);

	return (
		<div className={`${styles.messageEditorWrapper} ${isReplyInput ? styles.replyEditorWrapper : ''} ${isSidebarEmbed ? styles.sidebarEmbed : ''}`}>
			{
				(isPreview || (messageEditId && editMessageObj) || (messageReplyId && editReplyObj)) && (
					<div className={styles.messagePreviewContainer}>
						<div style={
							isSidebarEmbed || isReplyInput
								? { height: 10, width: 0 }
								: { height: 70, width: 70 }
						}
						/>
						<div className={`${styles.previewListContainer} ${isReplyInput ? styles.replyPreviewListContainer : ''} ${isSidebarEmbed ? styles.sidebarEmbedPreviewListContainer : ''}`}>
							<div className={styles.attachmentsPreviewList}>
								{isPreview || uploadingImgSrc ? (
									<div className={styles.attachmentContainer}>
										<div className={styles.attachmentStage}>
											{isUploading
												? <LoadingOutlined style={{ fontSize: 20 }} spin />
												: (
													<Tooltip title="Remove attachment">
														<Button
															type="text"
															icon={<CloseOutlined />}
															onClick={handleRemoveAttachment}
														/>
													</Tooltip>
												)}
										</div>
										{
											uploadingImgSrc
												? (
													<img
														src={uploadingImgSrc}
														alt="previewImg"
														style={isUploading ? { opacity: 0.5 } : { opacity: 1 }}
													/>
												)
												: <FileImageOutlined style={{ fontSize: 50, opacity: 0.5 }} />
										}
									</div>
								) : ''}
								{
									messageEditId && editMessageObj ? (
										<div className={styles.editMessageContainer}>
											<span>{editMessageObj?.content}</span>
											<div className={styles.attachmentStage}>
												<Tooltip title="Cancel">
													<Button
														type="text"
														icon={<CloseOutlined style={{ color: '#fff' }} />}
														onClick={() => {
															setMessageEditId('');
															setMessageInputValue({
																value: '',
																plainTextValue: '',
																mentions: [],
																attachments: [],
															});
														}}
													/>
												</Tooltip>
											</div>
										</div>
									) : ''
								}
								{
									messageReplyId && editReplyObj ? (
										<div className={styles.editReplyContainer}>
											<span>{editReplyObj?.content}</span>
											<div className={styles.attachmentStage}>
												<Tooltip title="Cancel">
													<Button
														type="text"
														icon={<CloseOutlined style={{ color: '#fff' }} />}
														onClick={() => {
															setMessageReplyId('');
															setMessageInputValue({
																value: '',
																plainTextValue: '',
																mentions: [],
																attachments: [],
															});
														}}
													/>
												</Tooltip>
											</div>
										</div>
									) : ''
								}
							</div>
						</div>
						<div style={
							isSidebarEmbed || isReplyInput
								? { height: 10, width: 0 }
								: { height: 70, width: 70 }
						}
						/>
					</div>
				)
			}
			<div className={styles.messageEditor}>
				{
					!isReplyInput && (
						<div className={styles.messageEditorAvatar} style={{ opacity: isDisabled ? '0.5' : '1' }}>
							<UserAvatar
								displayName={sessionData?.displayname}
								src={sessionData?.profilePic}
								id={sessionData?.userId}
								size={isSidebarEmbed ? 40 : 50}
							/>
						</div>
					)
				}
				<div
					role="none"
					className={styles.messageEditorInput}
					onClick={handleMessageEditorContainerClick}
				>
					{
						isReplyInput && (
							<div className={styles.replyEditorAvatar} style={{ opacity: isDisabled ? '0.5' : '1' }}>
								<UserAvatar
									displayName={sessionData?.displayname}
									src={sessionData?.profilePic}
									id={sessionData?.userId}
									size={isReplyInput ? 25 : 30}
									style={{ fontSize: isReplyInput ? 12 : 14 }}
								/>
							</div>
						)
					}
					<div className={`${styles.messageTextareaContainer} ${isSidebarEmbed ? ` ${styles.sidebarEmbed}` : ''}`}>
						{0 && messageEditId && editMessageObj ? (
							<div className={styles.currentEditMessageContainer}>
								<span>{editMessageObj.content}</span>
								<CloseOutlined
									style={{ position: 'absolute', right: '15px' }}
									onClick={() => {
										setMessageEditId('');
										setMessageInputValue({
											value: '',
											plainTextValue: '',
											mentions: [],
											attachments: [],
										});
									}}
								/>
							</div>
						) : ''}

						{0 && messageReplyId && editReplyObj ? (
							<div className={styles.currentEditMessageContainer}>
								<span>{editReplyObj.content}</span>
								<CloseOutlined
									style={{ position: 'absolute', right: '15px' }}
									onClick={() => {
										setMessageReplyId('');
										setMessageInputValue({
											value: '',
											plainTextValue: '',
											mentions: [],
											attachments: [],
										});
									}}
								/>
							</div>
						) : ''}
						<div
							className={styles.mentionsSugg}
							style={{ position: 'absolute' }}
							ref={mentionSuggestionsRef}
						>
							{/* <p>list here soon</p> */}
						</div>
						<MentionsInput
							allowSuggestionsAboveCursor
							suggestionsPortalHost={mentionSuggestionBoxElement}
							forceSuggestionsAboveCursor
							allowSpaceInQuery
							inputRef={messageInputRef}
							placeholder={`${isDisabled ? 'Only Admins can send message to this discussion group' : `${isReplyInput ? 'Type your reply here...' : 'Type your message here...'}`}`}
							value={messageInputValue.value}
							onChange={handleMessageInputChange}
							onKeyDown={(ev) => {
								if (ev.key === 'Enter') {
									ev.preventDefault();
									handlePostMessage();
								}
							}}
							disabled={isUploading || isDisabled}
							classNames={mentionsStyle}
							style={{ opacity: isDisabled ? '0.5' : '1' }}
						>
							<Mention
								trigger="@"
								className={mentionsStyle.mentions__mention}
								data={usersDataForMentions}
								appendSpaceOnAdd
								renderSuggestion={(suggestion, search, highlightedDisplay) => (
									<div className={styles.mentionSuggestionContainer}>
										<div className={styles.mentionSuggestionAvatarContainer}>
											<UserAvatar
												size={35}
												style={{ fontSize: 14 }}
												displayName={suggestion.display}
												id={suggestion.id.toString()}
											/>
										</div>
										<div className={styles.mentionSuggestionDetailsContainer}>
											<div>
												<span>{highlightedDisplay}</span>
											</div>
											<div>
												<span>{(suggestion as any).email}</span>
											</div>
										</div>
									</div>
								)}
								displayTransform={(id, display) => `@${display}`}
							/>
						</MentionsInput>
					</div>
					<div className={styles.uploadButtonContainer}>
						{
							messageInputValue.attachments.length ? '' : (
								<Tooltip
									title="Upload attachment"
								>
									<Upload
										beforeUpload={handleBeforeAttachmentUpload}
										customRequest={handleUploadAttachment}
										multiple={false}
										showUploadList={false}
										accept="image/*, .pdf"
										disabled={isDisabled}
									>
										<Button
											style={{ opacity: isDisabled ? '0.5' : '1' }}
											disabled={isDisabled}
											type="text"
											shape="circle"
											icon={(
												<UploadIcon style={
													isSidebarEmbed
														? { height: 15, width: 15 }
														: { height: 20, width: 20 }
												}
												/>
											)}
											loading={isUploading}
										/>
									</Upload>
								</Tooltip>
							)
						}
					</div>
					<div className={styles.addEmojiContainer}>
						{
							messageInputValue.attachments.length ? '' : (
								<Tooltip
									title="Add Emoji"
								>
									<Button
										type="text"
										shape="circle"
										icon={(
											<SmileOutlined
												className={styles.addEmoji}
											/>
										)}
										onClick={handleIsEmojiPickerModalVisible}
									/>
								</Tooltip>
							)
						}
					</div>
					{isEmojiPickerModalVisible
					&& (
						<div
							className={styles.emojiPickerContainer}
						>
							<div
								className={styles.emojiPicker}
								tabIndex={0}
								role="button"
								onKeyUp={(ev) => {}}
								onClick={(event) => {
									event.stopPropagation();
								}}
							>
								<EmojiPicker
									onEmojiClick={(emojiObject) => {
										handleAddEmojiToInput(emojiObject);
									}}
								/>
							</div>
						</div>
					)}
				</div>
				<div className={styles.sendButtonContainer}>
					<Button
						type="text"
						shape="circle"
						disabled={isUploading || isDisabled}
						onClick={handlePostMessage}
						icon={(
							<SendButtonIcon style={
								isSidebarEmbed
									? { height: 28, width: 28 }
									: { height: 35, width: 35 }
							}
							/>
						)}
						style={{ opacity: isDisabled ? '0.5' : '1' }}
					/>
				</div>
			</div>
		</div>
	);
};
