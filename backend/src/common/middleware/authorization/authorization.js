import { ForbiddenExeption } from "../../response/error.response.js"



export const Authorize = (...allowedRolles) =>{
    return (req ,res ,next) =>{
        if(!req.user || !allowedRolles.includes(req.role)){
            return ForbiddenExeption({message :"You are not allowed to perform this action" })
        }
        next()
    }
}