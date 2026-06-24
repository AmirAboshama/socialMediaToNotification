import type { Request, Response, NextFunction } from "express";import { TokenTypeEnum } from "../common/enums/tokenEnum.js";
import { unauthorizedError } from "../common/exeption/domain.exeption.js";
import TokenService from "../common/security/token.service.js";
import RedisServices from "../DB/redis/redis.services.js";

export function authMiddleware(tokenTypeParam = TokenTypeEnum.access) {
  const redisServices = new RedisServices();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {


      const { authorization } = req.headers;

      if (!authorization) {
        throw new unauthorizedError("Authorization header missing")
      }

      const [bearerKey, token] = authorization.split(' ');

      if (bearerKey !== "Bearer" || !token) {
        throw new unauthorizedError("Invalid Authorization header format")

      }

      console.log("Authorization:", authorization);
      if (!token) {
        throw new unauthorizedError("token not define ")

      }
  
     const{user,verifiedToken}= await TokenService.checkTocken(token)
      
      req.user = user;
      req.tokenPayload = verifiedToken;
      console.log("USER =", user);

      next();
    }catch (err) {
  console.error(err);
  
  next(err); // 👈 أهم سطر
}
  };
}