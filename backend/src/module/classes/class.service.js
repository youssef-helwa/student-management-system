import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { BranchModel } from "../../database/model/Branch.model.js"
import { ClassModel } from "../../database/model/class.model.js"
import { GradesModel } from "../../database/model/Grads.model.js"


const includeRefs = [
    { model: BranchModel, as: "branch" },
    { model: GradesModel, as: "Grade" }
]

export const GetAllClasses = async(query)=>{
    let {branchId, gradeId} = query
    let where ={}
    if(branchId) where.branchId = branchId
    if(gradeId) where.gradeId = gradeId
    let allclasses = await ClassModel.findAll({where ,include:includeRefs})
    if (allclasses.length === 0) {
        return [];
    }
    return allclasses
}

export const GetClass = async(id) =>{
    let cls = await ClassModel.findByPk(id , { include: includeRefs })
    if(!cls) return NotFoundExeption({message: "NO Class Found"})
    return cls

}

export const CreateClass = async(data) =>{
    let {name , teacher , branchId , gradeId} = data
    let classes = await ClassModel.findOne({where :{name , branchId , gradeId}})
    if(classes){
        return ConflictExeption({message: "Class Name is exist"})
    }
    let NewClass = await ClassModel.create({name , teacher , branchId , gradeId})
    return NewClass
}


export const updateClass =async(data, ClassId)=>{
    let Classs = await ClassModel.findByPk(ClassId)
    if(!Classs) return NotFoundExeption({message :"No Class Found"})
    await Classs.update(data)
    return Classs
}

export const DeleteClass = async(ClassId)=>{
    let cls = await ClassModel.findByPk(ClassId)
    if(!cls){
        return BadRequestExeption({message: "Class Not Found"})
    }
    await cls.destroy()
    return { success: true }
}