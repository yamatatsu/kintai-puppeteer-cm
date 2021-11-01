// import fetch from "node-fetch";

const fetch = (...args: any[]) =>
  // @ts-ignore
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

export function calcOver(workingTimes: number[]) {
  const sum = workingTimes.reduce((acc, m) => acc + m, 0);
  const base = workingTimes.length * 8 * 60;
  const over = sum - base;

  return `${over >= 0 ? "+" : ""}${over}`;
}

export const notify = async (text: string, url: string) => {
  const body = JSON.stringify({ text });
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    console.warn(res.status.toString());
  }
};
