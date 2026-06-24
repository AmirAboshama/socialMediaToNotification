import { client } from "./redis.connection.js";
import { emailEnum } from "../../common/enums/emailEnum.js";
import type { ObjectId } from "mongoose";
import { Types } from "mongoose";
export default class RedisServices {

   getBlackListTokenKey({ userId, tokenId }: { userId: string |ObjectId; tokenId: string }) {
      return `blackListToken::${userId}::${tokenId}`;
   }

   getOtpKey({ email, otpType }: { email: string; otpType: emailEnum }) {
      return `otp::${email}::${otpType}`;
   }

   getOtpReqNoKey({ email, otpType }: { email: string; otpType: emailEnum }) {
      return `otp::${email}::${otpType}::no`;
   }

   getOtpBlockedKey({ email, otpType }: { email: string; otpType: emailEnum }) {
      return `otp::${email}::${otpType}::blocked`;
   }

   async set({ key, value, exValue = 50 }: { key: string; value: string | number; exValue?: number }) {
      return await client.set(key, value, { EX: exValue });
   }

   async get(key: string) {
      return await client.get(key);
   }

   async del(key: string) {
      return await client.del(key);
   }

   async incr(key: string) {
      return await client.incr(key);
   }

   async decr(key: string) {
      return await client.decr(key);
   }

   async exists(key: string) {
      return await client.exists(key);
   }

   async ttl(key: string) {
      return await client.ttl(key);
   }

   async setExpire(key: string, seconds: number) {
      return await client.expire(key, seconds);
   }

   async removeExpire(key: string) {
      return await client.persist(key);
   }

   async hset(key: string, fields: Record<string, any>) {
      return await client.hSet(key, fields);
   }

   async mget(keys: string[]) {
      return await client.mGet(keys);
   }

getFcmKey(userId: string) {
   return `otp::${userId}::FCMToken`;
}
getSocketKey(userId: string) {
   return `socketIdUserIdS::${userId}::socketIdUserIdS`;
}


async addSocketToIdSet(
  userId: string,
  socketId: string
) {
  return await client.sAdd(
    this.getSocketKey(userId),socketId
  );
}
async removeSocketToIdSet(
  userId: string,
  socketId: string
) {
  return await client.sRem(
    this.getSocketKey(userId),socketId
  );
}
async getMemberSocketToIdSet(
  userId: string ,
) {
  return await client.sMembers(
    this.getSocketKey(userId),
  );
}

async addFcmToSet(
  userId: string,
  fcmToken: string
) {
  return await client.sAdd(
    this.getFcmKey(userId),
    fcmToken
  );
}

async getFcmSetMembers(userId: string) {
  return await client.sMembers(
    this.getFcmKey(userId)
  );
}


}