import puppeteer from "puppeteer";
import { KingOfTime } from "./KingOfTime";

export default async function useKingOfTime(
	callback: (page: KingOfTime) => Promise<void>,
) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	const kot = new KingOfTime(page);

	try {
		await callback(kot);
	} catch (err) {
		try {
			await kot.cap("error");
		} catch {
			// page may already be closed; ignore to preserve original error
		}
		throw err;
	} finally {
		await browser.close();
	}
}
