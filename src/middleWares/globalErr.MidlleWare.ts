
import type { Request, Response, NextFunction } from "express";
import { stat } from "node:fs";


interface IError extends Error {
    statusCode: number;
  }

function globalHandleMiddleWare (err: IError, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode||400).json({
      errMsg: err.message,
      stack: err.stack,
      cause: err.cause,
      error:JSON.stringify(err)
      
    });
  }



  export default   globalHandleMiddleWare