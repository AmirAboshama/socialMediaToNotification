import type { JwtPayload } from "jsonwebtoken"
import type { IUser } from "../../DB/models/user.model.js"


declare module  "express-serve-static-core"{
    interface Request{
        user:IUser,
        tokenPayload:JwtPayload
    }
}

