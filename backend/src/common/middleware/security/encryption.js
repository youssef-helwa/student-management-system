import bcrypt from "bcrypt"
import { env } from "../../../../config/env.services.js"
import { BadRequestExeption } from "../../response/error.response.js"

export const GenerateHash =async (plainText) =>{
    try {
        let hash = await bcrypt.hash(plainText , +env.salt)
        return hash
    } catch (error) {
        BadRequestExeption({message : "Error from Generate hash" , extra : error})
    }
}


export const CompareHash =async (plainText ,cypherText) => {
    try {
        let compare = await bcrypt.compare(plainText , cypherText)
    return compare
    } catch (error) {
        BadRequestExeption({message : "Can not compare hash " , extra : error})
    }
}
