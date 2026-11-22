import { env } from "../../../config/env.services.js"


export const ErrorRespose = ({
    message = "Somthing went worng",
status = 400,
extra = undefined
}={}) =>{
    throw new Error(message , {cause : {status , extra}})
}


export const BadRequestExeption = ({message = "Bad Request" , extra = undefined} = {}) =>{
    return ErrorRespose({message , status : 400 , extra})
}


export const NotFoundExeption = ({message = "Not Found Error" , extra = undefined}={})=>{
    return ErrorRespose({message , status : 404 , extra})
}

export const ConflictExeption = ({message = "Conflict Error" , extra = undefined}={}) =>{
    return ErrorRespose({message , status : 409 , extra})
}


export const UnAthorizeExption = ({message = "UnAuthorized Error" , extra = undefined}={}) =>{
    return ErrorRespose({message , status : 401 , extra})
}

export const ForbiddenExeption = ({message = "Forbidden Error" , extra = undefined}={}) =>{
    return ErrorRespose({message , status : 403 , extra})
}



export const GlobalError = (err ,req ,res ,next) =>{
    const mood = env.mood == "dev"

    const status = err.status ? err.status : err.cause ? err.cause.status : 500

    const defultMessage = "Somthing Went Wrong😒"
    const DisplayMessage = err.message || defultMessage
    res.status(status).json({
        error : mood ? DisplayMessage : defultMessage,
        stack : mood ? err.stack : null,
        extra : mood ? err.cause : null
    })
}