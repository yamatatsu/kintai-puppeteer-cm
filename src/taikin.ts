import puppeteer from "puppeteer";
import pRetry from "p-retry";
import { calcOver, notify } from "./lib";
import { KingOfTime } from "./KingOfTime";

const { ID, PW, NOTIFY_URL } = process.env;

console.info("start");
main()
  .then(() => {
    console.info("end");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function main() {
  if (!ID) throw new Error("環境変数ないよ ID");
  if (!PW) throw new Error("環境変数ないよ PW");
  if (!NOTIFY_URL) throw new Error("環境変数ないよ NOTIFY_URL");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const kot = new KingOfTime(page);

  try {
    await kot.login(ID, PW);

    await pRetry(() => kot.taikin(), { retries: 3 });

    await kot.gotoTimecard();

    const workingTimes = await kot.getWorkingTimes();
    const over = calcOver(workingTimes);

    const text = `たいきん 現在: ${over}min`;
    console.info(text);
    await notify(text, NOTIFY_URL);
  } catch (err) {
    await kot.cap("error");
    throw err;
  }

  await browser.close();
}
