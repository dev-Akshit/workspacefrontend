/* eslint-disable no-bitwise */
export function hashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i += 1) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash >>> 0;
}

export function intToRGB(i: number): string {
	const c = (i & 0x00FFFFFF)
		.toString(16)
		.toUpperCase();

	return '00000'.substring(0, 6 - c.length) + c;
}

export function intToHSL(i: number): string {
	return `hsl(${i % 360},50%,40%)`;
}

export function stringToRGB(str: string): string {
	return `#${intToRGB(hashCode(str))}`;
}

export function stringToHSL(str: string): string {
	return intToHSL(hashCode(str));
}
