import { Router } from "express";
import { auth } from "../../common/middleware/auth/auth.js";
import {Authorize} from '../../common/middleware/authorization/authorization.js'
import { SuccessRespose } from "../../common/response/success.response.js";
import { GetAllLOgs, SearchLog } from "./activityLogs.service.js";

const router = Router()


router.get('/Logs' , auth , Authorize('Administrator', 'Manager') , async(req ,res ) =>{
    let data = await GetAllLOgs()
    SuccessRespose({res, message :"All logs" , data})
})


router.get('/search' , auth ,Authorize('Administrator', 'Manager') , async(req , res) =>{
    let data = await SearchLog(req.query)
    SuccessRespose({res, message :"search logs" , data})
})


export default router