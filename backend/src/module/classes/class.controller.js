import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { CreateClass, DeleteClass, GetAllClasses, GetClass, updateClass } from "./class.service.js";


const router = Router()


router.get('/all' , auth ,async(req,res) =>{
    let data = await GetAllClasses(req.query)
    SuccessRespose({res , message:"Found All" , data})
})

router.get('/:id' , auth ,async(req,res) =>{
    let data = await GetClass(req.params.id)
    SuccessRespose({res , message:"Found" , data})
})

router.post('/add' , auth,Authorize('Administrator', 'Manager'),async (req ,res) =>{
    let data = await CreateClass(req.body)
    SuccessRespose({res , message:"Class Created",status : 201 , data})
})

router.put('/update/:id' , auth,Authorize('Administrator', 'Manager'),async (req ,res) =>{
    let data = await updateClass(req.body , req.params.id)
    SuccessRespose({res , message:"Class Updated" , data})
})

router.delete('/delete/:id' , auth,Authorize('Administrator', 'Manager'),async (req ,res) =>{
    let data = await DeleteClass(req.params.id)
    SuccessRespose({res , message:"Class Deleted" , data})
})

export default router