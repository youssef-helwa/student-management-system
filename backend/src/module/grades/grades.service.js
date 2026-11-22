import { Op } from "sequelize"
import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { GradesModel } from "../../database/model/Grads.model.js"






export const AllGrades = async()=>{
    let Grads = await GradesModel.findAll()
    return Grads
}


export const AllGradesID = async (id) =>{
    let Grade = await GradesModel.findByPk(id) 
    if(!Grade) return BadRequestExeption({message :'No Grade Found'})
    return Grade
}

export const CreateGrade = async (data) =>{
    let {name , order , branchId} = data
    if (!name || order === undefined || !branchId) {
        return BadRequestExeption({message: "Name and order are required"});
    }

    let existGrade = await GradesModel.findOne({where :{name , branchId}}) 
    if(existGrade) return BadRequestExeption({message :'Exist Grade'})
    let grade = await GradesModel.create({name , order , branchId})
    return grade
}


export const UpdateGrade = async(data , GradeId) =>{
    let {name , order} = data
    if(!name || order === undefined )return BadRequestExeption({message : "Name and order are required"})

    let grade = await GradesModel.findByPk(GradeId)
    if(!grade) return NotFoundExeption({message :" No Grade Found"})
    const existGrade = await GradesModel.findOne({
        where: {
            name,
            id: {
                [Op.ne]: gradeId,
            },
        },
    });

    if(existGrade) return ConflictExeption({message : 'Name Already Exist'})
    await grade.update({name , order})

    return {success : true , grade}
}


export const DeleteGrade = async(id) =>{
    let grade = await GradesModel.findByPk(id)
    if(!grade) return NotFoundExeption({message : "No Grade Found"})
    await grade.destroy()

    return {success : true}
}


export const GradesFee =  async (query) =>{
    let {branchId} = query
    let Grade = await GradesModel.findAll({
        where : {branchId},
        attributes:["id" , 'name' , "sessionFee" ,"order"] ,
        order:[["order", "ASC"]]
    }) 
    if(Grade.length === 0) return BadRequestExeption({message :'No Grade Found'})
    return Grade
}


export const CreateGradeFee = async(data , gradeId) =>{
    let {sessionFee} = data
    if(sessionFee === undefined || sessionFee === null){
        return BadRequestExeption({message:"session fee is required"})
    }
    if(Number(sessionFee) <= 0) {
        return BadRequestExeption({message:"Session fee must be greater than 0"})
    }

    const grade = await GradesModel.findByPk(gradeId)
    if(!grade){
        return BadRequestExeption({message : "no grade found"})
    }

    await grade.update({sessionFee: Number(sessionFee)})
    await grade.save()
    return grade
}




export const UpdateGradeFee = async(data , gradeId) =>{
    let {sessionFee} = data
    if(sessionFee === undefined || sessionFee === null){
        return BadRequestExeption({message:"session fee is required"})
    }
    if(Number(sessionFee) <= 0) {
        return BadRequestExeption({message:"Session fee cannot be negative"})
    }

    const grade = await GradesModel.findByPk(gradeId)
    if(!grade){
        return BadRequestExeption({message : "no grade found"})
    }

    await grade.update({sessionFee: Number(sessionFee)})
    await grade.save()
    return grade
}