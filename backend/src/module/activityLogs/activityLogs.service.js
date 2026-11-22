import {  Op } from "sequelize"
import { NotFoundExeption } from "../../common/response/error.response.js"
import { LogModel } from "../../database/model/ActivityLog.model.js"
import { UserModel } from "../../database/model/user.model.js"




export const GetAllLOgs =async() =>{
    let logs = await LogModel.findAll({
        include:[
            {model : UserModel,
            as:"user",
            attributes:["id" ,"fullName"]
            }
        ],
        order: [["createdAt", "DESC"]]
    })
    if(logs.length === 0){
        return NotFoundExeption({message :" No logs Found"})
    }
    return logs
}


export const SearchLog =async(data) =>{
    let {name , action , date} = data || {}
    const where = {}
    const userWhere = {}
    if(name){
        userWhere.fullName = {
            [Op.like] : `%${name}%`
        }
    }

    if(action){
        where.action  = action
    }

    if(date){
        where.createdAt  ={
            [Op.between] : [
                new Date(`${date} 00:00:00`),
                new Date(`${date} 23:59:59`)
            ]
        }
    }
    return await LogModel.findAll({
        where,
        include: [
            {
                model: UserModel,
                as: "user",
                attributes: ["id", "fullName"],
                where: userWhere,
                required: Object.keys(userWhere).length > 0
            }
        ],
        order: [["createdAt", "DESC"]]
    });
}