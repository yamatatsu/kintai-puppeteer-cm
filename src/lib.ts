import puppeteer from "puppeteer";
// import fetch from "node-fetch";

const fetch = (...args: any[]) =>
  // @ts-ignore
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

export async function login(page: puppeteer.Page, id: string, pw: string) {
  const _cap = cap(page);

  // ページ表示
  await page.goto("https://s2.kingtime.jp/independent/recorder/personal/");
  await _cap("0-1-login1");

  // 入力
  await page.type("input#id", id);
  await page.type("input#password", pw);
  await _cap("0-2-login2");

  // ログイン
  await page.click(".btn-control-message");

  // TOPページ表示を待つ
  await page.waitForSelector("#buttons");
  await _cap("0-3-top1");
}

export const cap =
  (page: puppeteer.Page) =>
  async (imageName: string, captureOptions?: puppeteer.ScreenshotOptions) => {
    await page.screenshot({ path: `caps/${imageName}.png`, ...captureOptions });
    console.info(`capture! ${imageName}`);
  };

export const notify = async (text: string, url: string) => {
  const body = JSON.stringify({ text });
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    console.warn(res.status.toString());
  }
};
