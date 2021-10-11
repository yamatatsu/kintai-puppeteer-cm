import puppeteer from "puppeteer";
import pRetry from "p-retry";
import { login, cap, notify } from "./lib";

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
  const _cap = cap(page);

  try {
    // ログインしてトップページの表示待つ
    await login(page, ID, PW);

    // 勤怠ボタン
    pRetry(clickKintai(page), { retries: 3 });

    await page.waitForTimeout(1000); // wait fade-in animation
    await _cap("1-0kintai");
  } catch (err) {
    await _cap("99-error");
    throw err;
  }

  await browser.close();

  await notify("たいきん", NOTIFY_URL);
}

function clickKintai(page: puppeteer.Page) {
  return async () => {
    await page.click(".record-clock-out");
    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("退勤が完了しました")'
    );
  };
}