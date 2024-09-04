interface AppConfig {
	MainServerURL: string
	QuizServerURL: string
	WorkspacesServerURL: string
	StaticStorageApiURL: string
	ReCaptchaSiteKey: string
}

export const APP_CONFIG: AppConfig = {
	MainServerURL: process.env.REACT_APP_WORKSPACES_SERVER_URL as string,
	QuizServerURL: process.env.REACT_APP_WORKSPACES_SERVER_URL as string,
	WorkspacesServerURL: process.env.REACT_APP_WORKSPACES_SERVER_URL as string,
	StaticStorageApiURL: process.env.REACT_APP_STATIC_STORAGE_API_URL as string,
	ReCaptchaSiteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY as string,
};

export * from './constants';
