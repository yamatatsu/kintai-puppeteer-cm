import { getEnv } from "./env";
import { getCredentials } from "./getCredentials";
import { calcOver, clearCapsDir, format, notify } from "./lib";
import useKingOfTime from "./useKingOfTime";

console.info("start");

clearCapsDir();

useKingOfTime(async (kot) => {
	const { NOTIFY_URL, DRY_RUN, OP_ITEM_ID } = getEnv();
	const { id: ID, pw: PW, totp } = getCredentials(OP_ITEM_ID);
	await kot.login(ID, PW, totp);

	!DRY_RUN && (await kot.taikin());

	await kot.gotoTimecard();

	const workedTimes = await kot.getWorkedTimes();
	const over = calcOver(workedTimes);

	const existsMissStamp = await kot.hasMissStamp();

	const text = format(`
    ${DRY_RUN ? "DRY RUN!!!" : ""}
    たいきん！ :zzz:${existsMissStamp ? " :warning:もれあり:warning:" : ""}
    げんじょう： *${over}min*
  `);
	console.info(text);

	await notify(text, NOTIFY_URL);
})
	.then(() => {
		console.info("end");
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
