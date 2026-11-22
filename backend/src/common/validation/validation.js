import { BadRequestExeption } from "../response/error.response.js"





export const Validate = (schema) =>{
    return (req , res , next) =>{
        let {value , error} = schema.Validate(req.body , {abortEarly  : false})
        if(error){
            return BadRequestExeption({message: "validation error", extra:error.details})
        }
        next()
    }
}