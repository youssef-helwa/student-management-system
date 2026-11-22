import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { AllNotification, DeleteNotification, readALLNotification, readNotification, UnreadNotification } from "./Notification.service.js";



const router = Router()


router.get('/All', auth, async (req, res) => {
    let data = await AllNotification(req.query)
    SuccessRespose({ res, message: "All notification", data })
})


router.get('/unread' , auth , async(req , res) =>{
    let data = await UnreadNotification(req.query)
    SuccessRespose({res , message : "Unread Count" , data})
})

router.patch('/read/:id' , auth , async(req , res) =>{
    let data = await readNotification(req.params.id)
    SuccessRespose({res , message : "readed" , data})
})

router.patch('/readAll' , auth , async(req , res) =>{
    let data = await readALLNotification(req.body)
    SuccessRespose({res , message : "readed All" , data})
})

router.delete('/delete/:id' , auth , async(req , res) =>{
    let data = await DeleteNotification(req.params.id)
    SuccessRespose({res , message : "Deleted" , data})
})


export default router



