import { Router } from "express";
import { SuccessRespose } from "../../common/response/success.response.js";
import { CreateBranch, DeleteBranch, GetAllBranches, GetBranchId, UpdateBranch } from "./branch.servise.js";
import { auth } from "../../common/middleware/auth/auth.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";


const router = Router()

router.get('/branches' , auth , async(req ,res) =>{
    let data = await GetAllBranches()
    SuccessRespose({res , message :"All Branches" , data})
})

router.post('/Create-Branch' ,auth ,Authorize('Administrator', 'Manager'),  async(req , res) =>{
    
    let data = await CreateBranch(req.body)
    SuccessRespose({res , message : "branch created", status: 201 , data})
})

router.get('/Get-branch/:id' , async(req , res) =>{
    let data = await GetBranchId(req.params.id)
    SuccessRespose({res , message : "branch created" , data})
})

router.put('/Update-branch/:id',auth , Authorize('Administrator', 'Manager') , async(req , res) =>{
    let data = await UpdateBranch(req.body ,req.params.id)
    SuccessRespose({res , message : "branch Updated" , data})
})

router.delete('/delete-branch/:id',auth , Authorize('Administrator', 'Manager') , async(req , res) =>{
    let data = await DeleteBranch(req.params.id)
    SuccessRespose({res , message : "branch deleted" , data})
})


export default router