import { LogModel } from "../../database/model/ActivityLog.model.js"




export const logActivity = async({action , userId , branchId , detail} ={}) =>{
    try {
        if(!action || !userId || !branchId || !detail) {
        return null
    }else{
        return LogModel.create({action , userId ,branchId , detail})
    }
    } catch (error) {
        console.log("Error while logging activity" , error)
        return null
    }
}