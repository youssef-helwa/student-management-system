import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { CreateStudent, DeleteStudent, GetAllStudent, GetStudent, GetStudentId, UpdateStudent } from "./student.service.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";

const router = Router()


router.get('/' , auth ,async (req ,res) =>{
    let data = await GetAllStudent(req.query)
    SuccessRespose({res ,message :"Student Found" , data})
})
router.get('/search' , auth ,async (req ,res) =>{
    console.log("from student")
    let data = await GetStudent(req.query)
    SuccessRespose({res ,message :"Student Found" , data})
})

router.get('/:id' , auth ,async (req ,res) =>{
    let data = await GetStudentId(req.params.id)
    SuccessRespose({res ,message :"Student Found" , data})
})


router.post('/add' ,auth , async(req ,res) =>{
    
    let data = await CreateStudent(req.body , req.user)
    SuccessRespose({res ,message :"Created" , status: 201 , data})
})

router.put('/update/:id' ,auth ,Authorize('Administrator', 'Manager'), async(req ,res) =>{  
    let data = await UpdateStudent(req.body , req.params.id , req.user.id)

    SuccessRespose({res ,message :"Updated"  , data})
})

router.delete('/delete/:id' ,auth ,Authorize('Administrator', 'Manager'), async(req ,res) =>{  
    let data = await DeleteStudent(req.body , req.params.id , req.user.id)
    SuccessRespose({res ,message :"Deleted"  , data})
})


export default router