import {
	Socket, ManagerOptions, io,
} from 'socket.io-client';
import { logger } from '../utils';

export interface SocketOptions {
	path: string;
	endpoint: string;
	query?: ManagerOptions['query']
	transports?: ManagerOptions['transports']
	timeout?: ManagerOptions['timeout']
}

export function CreateSocket(
	options: SocketOptions,
): Socket {
	const {
		path, endpoint, query, transports, timeout,
	} = options;

	const socket = io(endpoint, {
		path,
		autoConnect: false,
		transports: transports || ['websocket'],
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		timeout: timeout || 20000,
		withCredentials: true,
		query,
	});

	socket.on('connect', () => {
		logger.log(`socket connected to endpoint: ${endpoint}, path: ${path}`);
	});

	return socket;
}
