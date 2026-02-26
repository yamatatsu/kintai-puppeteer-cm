import { execSync } from "child_process";

type Credentials = {
  id: string;
  pw: string;
  totp: string;
};

export const getCredentials = (opItemId: string): Credentials => {
  const json = execSync(`op item get ${opItemId} --format json`).toString();
  const { fields } = JSON.parse(json);

  return {
    id: fields[0].value,
    pw: fields[1].value,
    totp: fields[3].totp,
  };
};
