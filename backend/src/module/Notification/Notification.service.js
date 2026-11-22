import { where } from "sequelize"
import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { NotificationModel } from "../../database/model/Notification.model.js"
import { StudentModel } from "../../database/model/Students.model.js"







export const AllNotification = async(query)=>{
    let {branchId} = query
    let where ={}
    if(branchId) where.branchId = branchId
    let notification = await NotificationModel.findAll({
        where,
        include : [{model : StudentModel , as : "student"}],
        order : [["createdAt" , "DESC"]]
    }) 
    return notification
}


export const UnreadNotification = async (query) =>{
    const {branchId} = query
    let where = {read : false}
    if(branchId) where.branchId = branchId
    let count = await NotificationModel.count({where})
    if(!count) return BadRequestExeption({message :"No Unreaded Notification found"})
    return count
}


export const readNotification = async(id) =>{
    let notification = await NotificationModel.findByPk(id)
    if(!notification){
        return NotFoundExeption({message:"Notification not found"})
    }
    notification.read = true
    await notification.save()
    return notification
}


export const readALLNotification = async(data) =>{
    let {branchId} = data

    const notification = await NotificationModel.update({read : true} , {where : {branchId , read :false}})
    if(notification.updatedCount === 0){
        return BadRequestExeption({message : "No unread notifications found"})
    }
    return notification
}


export const DeleteNotification = async(id)=>{
    let notification = await NotificationModel.findByPk(id)
    if(!notification){
        return NotFoundExeption({message : "No Notification Found"})
    }
    await notification.destroy()
    await notification.save()
    return {success : true}
}