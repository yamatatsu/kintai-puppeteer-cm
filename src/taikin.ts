import { calcOver, notify, format } from "./lib";
import useKingOfTime from "./useKingOfTime";
import { getEnv } from "./env";

console.info("start");

useKingOfTime(async (kot) => {
  const { ID, PW, NOTIFY_URL, DRY_RUN } = getEnv();

  await kot.login(ID, PW);

  !DRY_RUN && (await kot.taikin());

  await kot.gotoTimecard();

  const workedTimes = await kot.getWorkedTimes();
  const over = calcOver(workedTimes);

  const text = format(`
      :zzz:たいきん！:zzz: 
      げんじょう：*${over}min*
    `);
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
