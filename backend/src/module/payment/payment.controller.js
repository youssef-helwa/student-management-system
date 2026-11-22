import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { AllPayment, GetPayment, PaymentByStydent, TotalFee } from "./payment.service.js";


const router = Router()


router.get('/allpaymet', auth, async (req, res) => {
    let data = await AllPayment()
    SuccessRespose({ res, message: "All payment", data })
})

router.get('/paymetbystudent/:studentId', auth, async (req, res) => {
    let data = await PaymentByStydent(req.params.studentId)
    SuccessRespose({ res, message: "payment by student", data })
})


router.put('/total-fee' , auth , async(req , res) =>{
    let data = await TotalFee(req.body)
    SuccessRespose({res , message:"total fee update" , data})
})

router.get('/', auth, async (req, res) => {
    let data = await GetPayment(req.query)
    SuccessRespose({ res, message: "Get payment", data })
})

export default router