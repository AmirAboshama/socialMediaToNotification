import type { Response } from "express";


function succResponse<T>({res,statusCode=200, msg='done', data,}:{
        res:Response;
         statusCode?:number;
        msg?:string;
        data?:T,
       }) {
    return res.status(statusCode).json({
        msg,
        data
    })
}

export default succResponse
    
    