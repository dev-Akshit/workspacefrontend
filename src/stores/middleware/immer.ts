import { produce } from 'immer';
import { State, StateCreator } from 'zustand';

// magic middleware ;)
export const immer = <T extends State>(config: StateCreator<T>): StateCreator<T> => (
	(set, get, api) => config((partial, replace) => {
		const nextState = typeof partial === 'function'
			? produce(partial as (state: T) => T)
			: partial as T;
		return set(nextState, replace);
	}, get, api)
);
