
import { GraphQLError } from "graphql";
import customError from "./custom.error.js"

  export function MapGQLError(err:customError){
      throw new GraphQLError(err.message||"u dont have acces  ",{
        extensions :{
         statusCode: err.statusCode||401,
         cause:err.cause,
         stack:err.stack
        } }

    )
  }



export  class badRequestError extends customError {
    constructor(message: string="bad request",cause?:unknown    ) {
        super(message, 400, cause);
    }
}
export  class unauthorizedError extends customError {
    constructor(message: string="unauthorized",cause?:unknown    ) {
        super(message, 401, cause);
    }
}
export  class notFoundError  extends customError {
    constructor(message: string="not found",cause?:unknown    ) {
        super(message, 404, cause);
    }
}
export  class conflictError  extends customError {
    constructor(message: string="conflict",cause?:unknown    ) {
        super(message, 409, cause);
    }
}
