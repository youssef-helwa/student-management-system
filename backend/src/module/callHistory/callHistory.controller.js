import { Router } from "express";
import { SuccessRespose } from "../../common/response/success.response.js";
import { auth } from "../../common/middleware/auth/auth.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { Calls, GetCallOfStudent, LogCallResult } from "./callHistory.service.js";


const router = Router()

router.get("/options" , auth , async(req ,res) =>{
    let data = await Calls()
    SuccessRespose({res ,message : "All calls" , data})   
})

router.get("/Student/:studentId" , auth , async(req ,res) =>{
    let data = await GetCallOfStudent(req.params.studentId)
    SuccessRespose({res ,message : "Student calls Done" , data})   
})

router.post('/', auth, async (req, res) => {
    let data = await LogCallResult(req.body, req.user)
    SuccessRespose({ res, message: "Call logged", status: 201, data })
})




export default router


