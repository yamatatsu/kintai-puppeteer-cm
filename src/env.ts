export const getEnv = () => {
  const { ID, PW, NOTIFY_URL, DRY_RUN } = process.env;
  if (!ID) throw new Error("環境変数ないよ ID");
  if (!PW) throw new Error("環境変数ないよ PW");
  if (!NOTIFY_URL) throw new Error("環境変数ないよ NOTIFY_URL");

  const _DRY_RUN = DRY_RUN === "true" ? true : false;

  return { ID, PW, NOTIFY_URL, DRY_RUN: _DRY_RUN };
};
