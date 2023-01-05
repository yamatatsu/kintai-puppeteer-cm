import { calcOver, notify, format } from "./lib";
import useKingOfTime from "./useKingOfTime";
import { getEnv } from "./env";

/** 休憩時間(分)  */
const BREAK_TIME = 60;

console.info("start");

useKingOfTime(async (kot) => {
  const { ID, PW, NOTIFY_URL, DRY_RUN } = getEnv();

  await kot.login(ID, PW);

  !DRY_RUN && (await kot.syukkin());

  await kot.gotoTimecard();

  const workedTimes = await kot.getWorkedTimes();
  const businessDayCount = await kot.getBusinessDayCount();
  const startTime = await kot.getStartTimeOfToday();
  const existsMissStamp = await kot.hasMissStamp();

  const text = genText(
    workedTimes,
    businessDayCount,
    startTime,
    existsMissStamp
  );

  console.info(text);

  !DRY_RUN && (await notify(text, NOTIFY_URL));
})
  .then(() => {
    console.info("end");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// ========
// lib

const genText = (
  workedTimes: number[],
  businessDayCount: number,
  startTime: number,
  existsMissStamp: boolean
) => {
  const over = calcOver(workedTimes);
  const teiji = hhmm(startTime + 8 * 60 + BREAK_TIME);

  const neededTimeAverage = getNeededTimeAverage(workedTimes, businessDayCount);
  const target = hhmm(startTime + neededTimeAverage + BREAK_TIME);

  const text = format(`
      しゅっきん！ :rocket:${
        existsMissStamp ? " :warning:もれあり:warning:" : ""
      }
      げんじょう： *${over}min*
      きょうのていじ： *${teiji}*
      きょうのもくひょう： *${target}*
    `);
  return text;
};

const hhmm = (time: number) => {
  const min = time % 60;
  const hour = (time - min) / 60;

  const minStr = min.toString().padStart(2, "0");
  const hourStr = hour.toString().padStart(2, "0");

  return `${hourStr}:${minStr}`;
};

/**
 * 平滑化した場合の必要労働時間
 * 法定労働時間に足るための必要な労働時間を残日数で割ったもの(分)を返す
 */
const getNeededTimeAverage = (
  workedTimes: number[],
  businessDayCount: number
) => {
  const totalWorkedTime = workedTimes.reduce((acc, time) => acc + time, 0);
  const requiredTime = businessDayCount * 8 * 60;

  const totalNeededTime = requiredTime - totalWorkedTime;
  const restDayCount = businessDayCount - workedTimes.length;

  return Math.ceil(totalNeededTime / restDayCount);
};
