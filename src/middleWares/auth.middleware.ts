import type { Request, Response, NextFunction } from "express";import { TokenTypeEnum } from "../common/enums/tokenEnum.js";
import { unauthorizedError } from "../common/exeption/domain.exeption.js";
import tokenService from "../common/security/token.service.js";
import type { Jwt, JwtPayload } from "jsonwebtoken";
import type { roleEnum } from "../common/enums/userEnum.js";
import RedisServices from "../DB/redis/redis.services.js";
import userRebo from "../DB/Repo/user.Rebo.js";

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
      const decodedToken = tokenService.decodeToken(token) as JwtPayload
      if (!decodedToken||!decodedToken.aud){
        throw new unauthorizedError("invalid token bayload")

      }
      const [userRole, tokenType] = decodedToken.aud;

      if (tokenType !== tokenTypeParam) {
        throw new unauthorizedError("Invalid token type")

      }

      const { accessSigniture, refreshsigniture } =tokenService. getSignature(Number (userRole)  as roleEnum);

      const verifiedToken =tokenService.vertifyToken({
        token,
        Signiture: tokenTypeParam === TokenTypeEnum.access ? accessSigniture : refreshsigniture
      }) as JwtPayload;

      // Check if token is blacklisted
      const isBlackListed = verifiedToken.jti &&
        (await redisServices.exists(
          redisServices.getBlackListTokenKey({
            userId: verifiedToken.sub as string,
            tokenId: verifiedToken.jti
          })
        ));

      if (isBlackListed) {
throw new unauthorizedError("Session expired, please login again");
      }

      // Find user in DB
      const user = await userRebo.findById({
  id: verifiedToken.sub as string,
   

      });

      if (!user) {
                throw new unauthorizedError("User not found")

      }

      // Check if token issued before user's last credential change
      if (new Date(verifiedToken.iat! * 1000) < user.changeCredential!) {
                throw new unauthorizedError("Token expired due to credentials change")

      }

      console.log("User:", user);

      req.user = user;
      req.tokenPayload = verifiedToken;
      next();
    }catch (err) {
  console.error(err);
  next(err); // 👈 أهم سطر
}
  };
}