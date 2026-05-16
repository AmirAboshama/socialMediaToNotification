import { randomUUID, type SigningOptions } from "crypto";
import { TOKEN_SEGNITURE_ADMIN_ACCESS, TOKEN_SEGNITURE_ADMIN_REFRESH, TOKEN_SEGNITURE_USER_ACCESS, TOKEN_SEGNITURE_USER_REFRESH } from "../../config/config.service.js";
import { TokenTypeEnum } from "../enums/tokenEnum.js";
import { roleEnum } from "../enums/userEnum.js";
import jwt, { type SignOptions } from "jsonwebtoken"
import type { IHUser, IUser } from "../../DB/models/user.model.js";



class TokenService {

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

 }

 export default new TokenService ()