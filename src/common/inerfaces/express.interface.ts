import type { JwtPayload } from "jsonwebtoken"
import type { IHUser } from "../../DB/models/user.model.js"
import type { Socket } from "socket.io"


declare module  "express-serve-static-core"{
    interface Request{
        user:IHUser,
        tokenPayload:JwtPayload
    }
}

export interface socketTypeInterface  extends Socket{

data:{user:IHUser,verifiedToken:JwtPayload}
}