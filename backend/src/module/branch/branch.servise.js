import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { BranchModel } from "../../database/model/Branch.model.js"



export const GetAllBranches =async ()=>{
    let data = await BranchModel.findAll()
    if(data.length  == 0 ){
        return BadRequestExeption({message : "No Branches Found"})
    }
    return data
}




export const CreateBranch = async(data) =>{
    let {name , code , address} = data
    if(!name || !code || !address ){
        return BadRequestExeption({message :"please enter name , code, address"})
    }
    let existName = await BranchModel.findOne({where : {name}})
    if(existName){
        return ConflictExeption({message : "name is exist"})
    }
    let existcode = await BranchModel.findOne({where : {code}})
    if(existcode){
        return ConflictExeption({message : "code is exist"})
    }
    let branch = await BranchModel.create({name , address , code})
    return branch
    console.log("DATA:", data);
    console.log("USER ID:", userId);
    console.log("ROLE:", role);
    console.log("BRANCH ID:", branchId);
}

export const GetBranchId = async(branchId) =>{
    let branch = await BranchModel.findByPk(branchId)
    if(!branch){
        return NotFoundExeption({message :"their is no Branch"})
    }
    return branch
}


export const UpdateBranch =async (data ,branchId)=>{
    let {name ,code , address } = data || {}
    let branch = await BranchModel.findByPk(branchId)

    if(!branch){
        return BadRequestExeption({message : "No Branch Found"})
    }
    const newData = {}
    if(name) newData.name  =name
    if(code) newData.code  =code
    if(address) newData.address  =address

    let Update = await branch.update(newData)
    return Update

}

export const DeleteBranch = async(branchId) =>{
    let deletedCount = await BranchModel.destroy({where :{id: branchId}})
    if(deletedCount === 0 ){
        return NotFoundExeption({message: "their is no Branch"})
    }
    return {success : true}
}