export const getEnv = () => {
  const { NOTIFY_URL, DRY_RUN, OP_ITEM_ID } = process.env;
  if (!NOTIFY_URL) throw new Error("環境変数ないよ NOTIFY_URL");
  if (!OP_ITEM_ID) throw new Error("環境変数ないよ OP_ITEM_ID");

  const _DRY_RUN = DRY_RUN === "true" ? true : false;

  return { NOTIFY_URL, DRY_RUN: _DRY_RUN, OP_ITEM_ID };
};
