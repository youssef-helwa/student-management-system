import { Router } from "express";
import { SuccessRespose } from "../../common/response/success.response.js";
import { AddUser, DeleteUser, GetPermissionMatrix, GetUser, GetUserId, GetUserIdAdmin, Search, StatusOfUser, UpdateUser } from "./user.service.js";
import { auth } from "../../common/middleware/auth/auth.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { addUserSchema, UpdateUserSchema } from "./user.vaildation.js";
import { Validate } from "../../common/validation/validation.js";

const router = Router()


router.get('/users' ,auth , Authorize('Administrator', 'Manager'), async(req , res) =>{
    let data = await GetUser()
    SuccessRespose({res ,message : "All users" , data})    
})
// for admin check
router.get('/user/:id' ,auth, Authorize('Administrator', 'Manager') ,async(req , res) =>{
    let data = await GetUserIdAdmin(req.params.id)
    SuccessRespose({res ,message : "User retrieved successfully" , data})    
})


router.post('/add-user'  , auth,Authorize('Administrator', 'Manager'),  async(req , res) =>{
    let data = await AddUser(req.body)
    SuccessRespose({res ,message : "user created " , status :201 , data})
})

router.get('/me' ,auth, async(req , res) =>{
    let data = await GetUserId(req.user)
    SuccessRespose({res , message : "User retrieved successfully" , data})
})

router.put('/update-user/:id' ,auth ,Validate(UpdateUserSchema) , Authorize('Administrator', 'Manager')  ,async(req ,res)=>{
    let data = await UpdateUser(req.body, req.params.id)
    SuccessRespose({res , message : "Done" , data})
})

router.delete('/delete-user/:id' , auth ,Authorize('Administrator', 'Manager') , async(req ,res) =>{
    let data = await DeleteUser(req.params.id)
    SuccessRespose({res , message : "deleted successfully" , data})
})

router.put('/user-status/:id' ,auth , Authorize('Administrator', 'Manager')  ,async(req ,res)=>{
    let data = await StatusOfUser(req.body, req.params.id)
    SuccessRespose({res , message : "change status" , data})
})

router.get('/search' , auth , Authorize('Administrator', 'Manager') , async(req , res) =>{
    let data = await Search(req.query.search)
    SuccessRespose({res , message : `This is the user` , data})
})


router.get('/permission' , auth , async(req ,res) =>{
    let data = await GetPermissionMatrix()
    SuccessRespose({res , message : `Permission matrix` , data})
})



export default router