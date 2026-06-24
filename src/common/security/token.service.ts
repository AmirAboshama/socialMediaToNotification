import { randomUUID, type SigningOptions } from "crypto";
import { TOKEN_SEGNITURE_ADMIN_ACCESS, TOKEN_SEGNITURE_ADMIN_REFRESH, TOKEN_SEGNITURE_USER_ACCESS, TOKEN_SEGNITURE_USER_REFRESH } from "../../config/config.service.js";
import { TokenTypeEnum } from "../enums/tokenEnum.js";
import { roleEnum } from "../enums/userEnum.js";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken"
import type { IHUser, IUser } from "../../DB/models/user.model.js";
import { unauthorizedError } from "../exeption/domain.exeption.js";
import RedisServices from "../../DB/redis/redis.services.js";
import userRebo from "../../DB/Repo/user.Rebo.js";



class TokenService {
 private _redisService= new RedisServices 
 private _userRebo= userRebo
constructor (){}

 getSignature(role = roleEnum.User) {
    let refreshsigniture = "";
    let accessSigniture = "";
    switch (role) {
        case roleEnum.User:
            refreshsigniture = TOKEN_SEGNITURE_USER_REFRESH
            accessSigniture = TOKEN_SEGNITURE_USER_ACCESS
            break;


        case roleEnum.Admin:
            refreshsigniture = TOKEN_SEGNITURE_ADMIN_REFRESH
            accessSigniture = TOKEN_SEGNITURE_ADMIN_ACCESS
            break;
    }
    return { accessSigniture, refreshsigniture }
}

 generateToken({ paylood = {}, Signiture, options = {} }: { paylood?: string | object, Signiture: string, options?: SignOptions }) {

    return jwt.sign(paylood, Signiture, options);
}
 vertifyToken({ token, Signiture }: { token: string, Signiture: string }) {

    return jwt.verify(token, Signiture);
}
 decodeToken(token:string) {

    return jwt.decode(token);
}

 generateAccessAndRefreshToken(user:IHUser) {
    const { accessSigniture, refreshsigniture } = this.getSignature(user.role);
    console.log(user.role);
    console.log({
        accessSigniture,
        refreshsigniture
    });

    const tokenId = randomUUID()
  const accessToken = this.generateToken({
  Signiture: accessSigniture,
  options: {
    noTimestamp: true,
    subject: user._id.toString(),
    expiresIn: 80 * 80,
    audience: [String(user.role), TokenTypeEnum.access],
    jwtid: tokenId,
  }
});

const refreshToken = this.generateToken({
  Signiture: refreshsigniture,
  options: {
    noTimestamp: true,
    subject: user._id.toString(),
    expiresIn: "1y",
    audience: [String(user.role), TokenTypeEnum.refresh],
    jwtid: tokenId,
  }
});

return { accessToken, refreshToken };
}
async checkTocken(
  token: string,
  tokenTypeParam: TokenTypeEnum = TokenTypeEnum.access
){      const decodedToken = this.decodeToken(token) as JwtPayload
      if (!decodedToken||!decodedToken.aud){
        throw new unauthorizedError("invalid token bayload")

      }
      const [userRole, tokenType] = decodedToken.aud;

      if (tokenType !== tokenTypeParam) {
        throw new unauthorizedError("Invalid token type")

      }

      const { accessSigniture, refreshsigniture } =this. getSignature(Number (userRole)  as roleEnum);

      const verifiedToken =this.vertifyToken({
        token,
        Signiture: tokenTypeParam === TokenTypeEnum.access ? accessSigniture : refreshsigniture
      }) as JwtPayload;

      // Check if token is blacklisted
      const isBlackListed = verifiedToken.jti &&
        (await this._redisService.exists(
          this._redisService.getBlackListTokenKey({
            userId: verifiedToken.sub as string,
            tokenId: verifiedToken.jti
          })
        ));

      if (isBlackListed) {
throw new unauthorizedError("Session expired, please login again");
      }

      // Find user in DB
      const user = await this._userRebo.findById({
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
      return  {user ,verifiedToken}

}
 }

 export default new TokenService ()