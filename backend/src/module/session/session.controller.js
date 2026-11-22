import Router from "express"
import {auth} from "../../common/middleware/auth/auth.js"
import {SuccessRespose} from "../../common/response/success.response.js"
import { closedSession, GetActiveSessionForClass, GetSessionAttendance, GetSessionById, StartSession } from "./session.service.js"
const router = Router()


router.post("/start" , auth , async(req , res) =>{
    let data = await StartSession(req.body , req.user)
    SuccessRespose({res , message :"session started" , data})
})

router.get("/active/:classId" , auth , async(req , res) =>{
    let data = await GetActiveSessionForClass(req.params.classId)
    SuccessRespose({res , message :"active session" , data})
})


router.get("/:id" , auth , async(req , res) =>{
    let data = await GetSessionById(req.params.id , req.user)
    SuccessRespose({res , message :"session" , data})
})


router.post("/close/:id" , auth , async(req , res) =>{
    let data = await closedSession(req.params.id , req.user)
    SuccessRespose({res , message :"session closed" , data})
})


router.get("/att/:id" , auth , async(req , res) =>{
    let data = await GetSessionAttendance(req.params.id)
    SuccessRespose({res , message :"session attendance" , data})
})





export default router