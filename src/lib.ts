import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import fetch from "node-fetch";

export function calcOver(workedTimes: number[]) {
	const sum = workedTimes.reduce((acc, m) => acc + m, 0);
	const base = workedTimes.length * 8 * 60;
	const over = sum - base;

	return `${over >= 0 ? "+" : ""}${over}`;
}

export const notify = async (text: string, url: string) => {
	const body = JSON.stringify({ text });
	const headers = { "Content-Type": "application/json" };

	const res = await fetch(url, { method: "POST", headers, body });
	if (!res.ok) {
		console.warn(res.status.toString());
	}
};

export const format = (str: string) => str.trim().replace(/\n\s+/g, "\n");

export const clearCapsDir = () => {
	const capsDirPath = resolve(__dirname, "../caps");
	rmSync(capsDirPath, { recursive: true, force: true });
	mkdirSync(capsDirPath, { recursive: true });
};
