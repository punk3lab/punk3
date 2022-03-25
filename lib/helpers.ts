// @ts-ignore
import omitDeep from "omit-deep";

export const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export const shortAddress = (addr: string | null | undefined) => {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};

export const prettyJSON = (message: string, obj: string) => {
  console.log(message, JSON.stringify(obj, null, 2));
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const omit = (object: any, name: string) => {
  return omitDeep(object, name);
};

export const getPubId = (internalID: string): string => {
  return internalID.split("-")[1];
};
