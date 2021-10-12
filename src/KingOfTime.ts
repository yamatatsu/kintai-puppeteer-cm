import puppeteer from "puppeteer";

const url = "https://s2.kingtime.jp/independent/recorder/personal/";

export class KingOfTime {
  private capCount = 1;

  constructor(private readonly page: puppeteer.Page) {}

  public async login(id: string, pw: string) {
    // ページ表示
    await this.page.goto(url);
    await this.cap("login");

    // 入力
    await this.page.type("input#id", id);
    await this.page.type("input#password", pw);
    await this.cap("login-inputed");

    // ログイン
    await this.page.click(".btn-control-message");

    // TOPページ表示を待つ
    await this.page.waitForSelector("#buttons", { visible: true });
    await this.waitText("データを取得しました");

    await this.cap("top");
  }

  public async syukkin() {
    await this.clickKintai(".record-clock-in", "出勤が完了しました");
  }
  public async taikin() {
    await this.clickKintai(".record-clock-out", "退勤が完了しました");
  }

  public async gotoTimecard() {
    await this.page.click("#menu_icon");
    await this.page.waitForSelector(".menu-item", { visible: true });
    await this.cap("menu");
    await this.page.click(".menu-item");
    await this.page.waitForSelector("td.custom11 p", { visible: true });
    await this.cap("timecard");
  }

  /**
   * 働いた日数分の労働時間（分）を配列で返す
   */
  public async getWorkingTimes(): Promise<number[]> {
    const texts = await this.getTexts("td.custom11 p");

    const workingTimes = texts.map((t) => {
      const [hour, minute] = t.split(".").map(Number);
      return hour * 60 + minute;
    });

    return workingTimes;
  }

  public async cap(
    imageName: string,
    captureOptions?: puppeteer.ScreenshotOptions
  ) {
    await this.page.screenshot({
      path: `caps/${this.capCount}-${imageName}.png`,
      ...captureOptions,
    });
    console.info(`capture! ${imageName}`);
    this.capCount++;
  }

  private async clickKintai(btnSelector: string, waitText: string) {
    await this.page.click(btnSelector);
    await this.waitText(waitText);

    await this.page.waitForTimeout(1000); // wait fade-in animation
    await this.cap("kintai");
  }

  /**
   * selectorでヒットした要素のinnerTextの配列（空文字除去済み）を返す。
   * @param selector
   */
  private async getTexts(selector: string): Promise<string[]> {
    const elements = await this.page.$$(selector);
    const textPromiseList = elements.map(async (el) => {
      const content = await el.getProperty("textContent");
      const text = await content?.jsonValue<string>();
      return text?.trim() ?? "";
    });
    const textes = await Promise.all(textPromiseList);
    return textes.filter(Boolean);
  }

  private async waitText(waitText: string) {
    await this.page.waitForFunction(
      `document.querySelector("body").innerText.includes("${waitText}")`,
      { timeout: 2000 }
    );
  }
}
