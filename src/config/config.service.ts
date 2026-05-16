import path from 'path'
import dotenv from 'dotenv'


export  const NODE_ENV=process.env.NODE_ENV

const envPath ={
    dev:path.resolve("./config/.env.dev"),
    prod:path.resolve("./config/.env.prod"),
}

dotenv.config({path:path.resolve("./.env.dev")})


export const SERVER_PORT=process.env.PORT || 5000
export const DB_URL_LOCAL=process.env.DB_URL_LOCAL || ""
export const DB_URL_ATLAS=process.env.DB_URL_ATLAS || ""
export const REDIS_CONNECTION=process.env.REDIS_CONNECTION || "http://localhost:5000"as string
 export const  SALT_ROUND=parseInt(process.env.PASSWORD_HASHING_SALT_ROUND as string)||12
 export const EMCRYPTION_KEY= process.env.EMCRYPTION_KEY as string
 export const TOKEN_SEGNITURE_USER_ACCESS= process.env.TOKEN_SEGNITURE_USER_ACCESS as string
 export const TOKEN_SEGNITURE_ADMIN_ACCESS= process.env.TOKEN_SEGNITURE_ADMIN_ACCESS as string
 export const TOKEN_SEGNITURE_USER_REFRESH= process.env.TOKEN_SEGNITURE_USER_REFRESH as string
 export const TOKEN_SEGNITURE_ADMIN_REFRESH= process.env.TOKEN_SEGNITURE_ADMIN_REFRESH as string
 export const GOOGLE_CLIENT_ID= process.env.GOOGLE_CLIENT_ID as string
 export const MAIL_USER= process.env.MAIL_USER as string
 export const MAIL_PASS= process.env.MAIL_PASS as string






 export const REGION=process.env.REGION || "eu-north-1"
 export const ACCESS_KEY_ID=process.env.ACCESS_KEY_ID || "AKIA5Z6Q2K7XG3V4Z5A"
 export const SECRET_ACCESS_KEY=process.env.SECRET_ACCESS_KEY || "3Vdk5wJTn9L2bd/AILXM3xM55Uj1x5Y2ZT6lw2be"
 export const BUCKET_NAME=process.env.BUCKET_NAME || "social-media-app-1998"
 export const APPLICATION_NAME=process.env.APPLICATION_NAME || "social-media-app-1998"

