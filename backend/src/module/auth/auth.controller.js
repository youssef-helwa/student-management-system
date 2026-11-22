import { Router } from "express";
import { SuccessRespose } from "../../common/response/success.response.js";
import { ChangePass, GetAdmin, login, Logout, ResetPass, SetAdmin } from "./auth.service.js";
import { auth } from "../../common/middleware/auth/auth.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";


const router = Router()


router.get('/setup-status' , async(req, res) =>{
    let data = await GetAdmin()
    SuccessRespose({res , message : "status success" , data})
})


router.post('/setup' , async(req , res) =>{
    let data = await SetAdmin(req.body)
    SuccessRespose({res , message : "welcome admin" , data})
})


router.post('/login' ,async (req , res )=>{
    let data = await login(req.body)
    SuccessRespose({res , message : "login Successfully" , data})
})


router.post('/logout' ,async (req , res )=>{
    let data = await Logout(req.body)
    SuccessRespose({res , message : "logged out Successfully" , data})
})

// password staff
router.post('/change-password',auth ,async (req , res )=>{
    let data = await ChangePass(req.body ,req.user)
    SuccessRespose({res , message : "Password changed successfully" , data})
})

router.patch('/reset-password/:id', auth , Authorize('Administrator', 'Manager') ,async (req , res )=>{
    let data = await ResetPass(req.body ,req.params.id)
    SuccessRespose({res , message : "Password changed successfully" , data})
})


export default router