import puppeteer from "puppeteer";
import { KingOfTime } from "./KingOfTime";

export default async function useKingOfTime(
  callback: (page: KingOfTime) => Promise<void>
) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const kot = new KingOfTime(page);

  try {
    await callback(kot);
  } catch (err) {
    await kot.cap("error");
    throw err;
  }

  await browser.close();
}
