import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { ApprovedExpenses, CreateExpenses, deleteExpenses, GetExpenseId, GetExpenses, RejectExpense, UpdateExpenses } from "./expenses.service.js";



const router = Router()


router.get("/" , auth , async (req , res) =>{
    let data = await GetExpenses(req.query , req.user , req.role)
    SuccessRespose({ res, message: "AllExpenses", data })
})

router.get('/:id', auth, async (req, res) => {
    let data = await GetExpenseId(req.params.id , req.user , req.role)
    SuccessRespose({ res, message: "Expenses retrieved", data })
})

router.post('/add' , auth , async(req , res) =>{
    let data = await CreateExpenses(req.body , req.user)
    SuccessRespose({ res, message: "Expenses Created", data })
})


router.put('/update/:id' , auth, Authorize('Administrator' ,'Manager') , async(req , res) =>{
    let data = await UpdateExpenses(req.body , req.params.id , req.user , req.role)
    SuccessRespose({ res, message: "Expenses Updated", data })
})



router.delete('/delete/:id' , auth, Authorize('Administrator') , async(req , res) =>{
    let data = await deleteExpenses( req.params.id , req.user)
    SuccessRespose({ res, message: "Expenses Deleted", data })
})

router.put('/approve/:id' ,auth ,Authorize('Administrator','Manager') , async(req, res) =>{
    let data = await ApprovedExpenses(req.params.id, req.user)
    SuccessRespose({ res, message: "Expenses Approved", data })
})
router.put('/reject/:id' ,auth ,Authorize('Administrator','Manager') , async(req, res) =>{
    let data = await RejectExpense(req.params.id, req.user)
    SuccessRespose({ res, message: "Expenses Rejected", data })
})


export default router