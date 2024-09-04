import {
	useCallback, useEffect, useRef, useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { logger } from '../libs/utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function usePagination(
	getPrevData?: (limit: number) => Promise<boolean>,
	getNextData?: (limit: number) => Promise<boolean>,
) {
	const [prevDataLoading, setPrevDataLoading] = useState<boolean>(false);
	const [nextDataLoading, setNextDataLoading] = useState<boolean>(false);

	const prevDataAvailableRef = useRef<boolean>(true);
	const nextDataAvailableRef = useRef<boolean>(true);

	const dataListObserverRef = useRef<IntersectionObserver>();
	const lastHtmlElementRef = useRef<HTMLElement | null>(null);

	const [scrollToDataNodeId, setScrollToDataNodeId] = useState<string | null>();
	const [scrollToDataNodeReplyId, setScrollToDataNodeReplyId] = useState<string | null>();
	const [scrollToEnd, setScrollToEnd] = useState<boolean>();
	const [goToBottomVisible, setGoToBottomVisible] = useState<boolean>(false);

	const [dataListContainer, setDataListContainer] = useState<HTMLDivElement | null>(null);
	const [firstDataNodeContainer, setFirstDataNodeContainer] = useState<HTMLDivElement | null>(null);
	const [lastDataNodeContainer, setLastDataNodeContainer] = useState<HTMLDivElement | null>(null);
	const [
		currentDataNodeContainer, setCurrentDataNodeContainer,
	] = useState<HTMLDivElement | null>(null);
	const [upScrollAllowed, setUpScrollAllowed] = useState(false);

	const dataListContainerRef = useCallback(
		(node: HTMLDivElement) => setDataListContainer(node), [],
	);
	const firstDataNodeContainerRef = useCallback(
		(node: HTMLDivElement) => setFirstDataNodeContainer(node), [],
	);
	const lastDataNodeContainerRef = useCallback(
		(node: HTMLDivElement) => setLastDataNodeContainer(node), [],
	);
	const currentDataNodeContainerRef = useCallback(
		(node: HTMLDivElement) => setCurrentDataNodeContainer(node), [],
	);

	const scrollToCurrentDataNode = useCallback(() => {
		let timeoutId: NodeJS.Timeout;
		if (currentDataNodeContainer) {
			currentDataNodeContainer.classList.add('flash-highlight');

			currentDataNodeContainer.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });

			timeoutId = setTimeout(() => {
				currentDataNodeContainer.classList.remove('flash-highlight');

				clearTimeout(timeoutId);
			}, 2500);
		}
	}, [currentDataNodeContainer]);

	const scrollToContainer = useCallback((element: HTMLElement) => {
		if (!element) {
			return;
		}
		element.classList.add('flash-highlight');
		element.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
		setTimeout(() => {
			element.classList.remove('flash-highlight');
		}, 2500);
	}, []);

	const intersectionObserverCallback = useDebouncedCallback(useCallback(
		async (entries: IntersectionObserverEntry[]) => {
			logger.log(entries);

			entries.forEach(async (entry: IntersectionObserverEntry) => {
				if (entry.target === firstDataNodeContainer) {
					if (entry.isIntersecting) {
						try {
							if (prevDataAvailableRef.current) {
								if (!scrollToEnd && upScrollAllowed) {
									logger.log('getting prev messages...');
									if (upScrollAllowed
										&& dataListContainer?.scrollHeight !== dataListContainer?.clientHeight) {
										setPrevDataLoading(true);
									}

									const prevScrollArea = dataListContainer?.scrollHeight;
									const fetched = await getPrevData?.(10);
									const nowScrollArea = dataListContainer?.scrollHeight;

									if (fetched) {
										if (upScrollAllowed) {
											dataListContainer?.scrollTo({
												top: nowScrollArea && prevScrollArea
													? (nowScrollArea - prevScrollArea) : 0,
											});
										}
									} else {
										logger.log('prev data empty');
										prevDataAvailableRef.current = false;
									}
								}
							}
						} finally {
							setPrevDataLoading(false);
						}

						setUpScrollAllowed(true);
					} else {
						setUpScrollAllowed(true);
					}
				}

				if (entry.target === lastDataNodeContainer) {
					if (entry.isIntersecting) {
						try {
							if (nextDataAvailableRef.current) {
								logger.log('getting next messages...');
								if (dataListContainer?.scrollHeight !== dataListContainer?.clientHeight) {
									setNextDataLoading(true);
								}

								const fetched = await getNextData?.(10);

								if (fetched) {
									dataListContainer?.scrollTo({
										top: 3 * (dataListContainer.scrollHeight / 5),
									});
								} else {
									logger.log('next data empty');
									nextDataAvailableRef.current = false;
								}
							}
						} finally {
							setNextDataLoading(false);
						}

						setGoToBottomVisible(false);
					} else {
						if (!goToBottomVisible) {
							if (!lastHtmlElementRef || lastHtmlElementRef.current !== lastDataNodeContainer) {
								scrollToContainer(lastDataNodeContainer);
							}
						}
						setGoToBottomVisible(true);
					}
				}

				if (scrollToDataNodeId) {
					scrollToCurrentDataNode();
				}
			});
			lastHtmlElementRef.current = lastDataNodeContainer;
		}, [
			scrollToDataNodeId, firstDataNodeContainer, lastDataNodeContainer, dataListContainer,
			getPrevData, getNextData, scrollToCurrentDataNode, upScrollAllowed,
			scrollToEnd, goToBottomVisible, scrollToContainer,
		],
	), 500, {
		leading: true,
	});

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (scrollToEnd && dataListContainer) {
			timeoutId = setTimeout(() => {
				dataListContainer.scrollTo({ top: dataListContainer.scrollHeight, behavior: 'smooth' });
				setScrollToEnd(false);

				// prevDataAvailableRef.current = true;
				// nextDataAvailableRef.current = false;
			}, 100);
		}

		return () => clearTimeout(timeoutId);
	}, [
		scrollToEnd, dataListContainer,
	]);

	useEffect(() => {
		if (dataListContainer) {
			dataListObserverRef.current = new IntersectionObserver(intersectionObserverCallback, {
				root: dataListContainer,
				threshold: 0.5,
			});

			if (firstDataNodeContainer) {
				dataListObserverRef.current.observe(firstDataNodeContainer);
			}

			if (lastDataNodeContainer) {
				dataListObserverRef.current.observe(lastDataNodeContainer);
			}
		}

		return () => {
			dataListObserverRef.current?.disconnect();
		};
	}, [
		dataListContainer, firstDataNodeContainer, lastDataNodeContainer, intersectionObserverCallback,
	]);

	useEffect(() => {
		if (currentDataNodeContainer) {
			scrollToCurrentDataNode();

			setTimeout(() => {
				setScrollToDataNodeId(null);
			}, 1500);
		}
	}, [dataListContainer, currentDataNodeContainer, scrollToCurrentDataNode]);

	const resetPagination = useCallback(
		async (prevAvailable: boolean, nextAvailable: boolean) => {
			prevDataAvailableRef.current = prevAvailable;
			nextDataAvailableRef.current = nextAvailable;
		}, [],
	);

	return {
		scrollToDataNodeId,
		scrollToDataNodeReplyId,
		goToBottomVisible,
		setGoToBottomVisible,
		prevDataLoading,
		nextDataLoading,

		dataListContainerRef,
		firstDataNodeContainerRef,
		lastDataNodeContainerRef,
		currentDataNodeContainerRef,

		resetPagination,
		setScrollToDataNodeId,
		setScrollToDataNodeReplyId,
		setScrollToEnd,
		setUpScrollAllowed,
	};
}
