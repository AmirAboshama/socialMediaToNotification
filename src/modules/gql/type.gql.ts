import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/models/user.model.js";



export type contextType= {user:IHUser,tokenPayload:JwtPayload

}