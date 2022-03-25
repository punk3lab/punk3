import NextAuth from "next-auth";
import { SiweMessage } from "siwe";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

import type { NextAuthOptions } from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        // verify signature
        try {
          const { message, signature }: any = credentials;
          const siweMessage = new SiweMessage(message);
          const fields = await siweMessage.validate(signature);
          // create user
          const { address } = fields;
          const user = await prisma.user.upsert({
            where: {
              id: address,
            },
            update: {},
            create: {
              id: address,
              name: address,
              address: address,
            },
          });
          return {
            id: address,
            name: address,
            email: "fsdfds@gmail.com",
          };
        } catch (error: any) {
          throw new Error(error.response.data.msg);
        }
      },
    }),
  ],
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  secret: process.env.SECRET,
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: ({ session, token }: any) => {
      session.user = token.user;
      return session;
    },
  },
} as NextAuthOptions;

export default NextAuth(authOptions);
