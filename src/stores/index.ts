import { CQWorkspacesClient } from '../clients';
import { APP_CONFIG } from '../config';
import { createAppStore } from './app-store';

export * from './app-store';

const cqWorkspacesClient = new CQWorkspacesClient({
	cqServerURL: APP_CONFIG.MainServerURL,
	workspacesServerURL: APP_CONFIG.WorkspacesServerURL,
	staticStorageApiURL: APP_CONFIG.StaticStorageApiURL,
});

export const useAppStore = createAppStore(cqWorkspacesClient);
