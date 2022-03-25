import { create } from "ipfs-http-client";
const token = Buffer.from(
  `${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}:${process.env.NEXT_PUBLIC_INFURA_SECRET}`,
).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    Authorization: `Basic ${token}`,
  },
});

export const uploadIpfs = async (metadata: string) => {
  const result = await client.add(metadata);
  return result;
};
