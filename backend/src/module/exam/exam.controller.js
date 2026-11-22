import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { AllExams, CreateExam, GetAllResulte, GetExamId, GetExamResulte, GetExams, GetResultAuditTrail, GetStudentResulte, markAbcentStudent, savResulte, UpdateExam } from "./exam.service.js";


const router = Router()


router.get('/all', auth, async (req, res) => {
    let data = await AllExams()
    SuccessRespose({ res, message: "All Exams", data })
})

router.get('/', auth, async (req, res) => {
    let data = await GetExams(req.query)
    SuccessRespose({ res, message: "All Grades", data })
})


router.get('/results/all', auth, async (req, res) => {
    let data = await GetAllResulte()
    SuccessRespose({ res, message: "All Resulte", data })
})

router.get('/:id', auth, async (req, res) => {
    let data = await GetExamId(req.params.id)
    SuccessRespose({ res, message: "Exam Found", data })
})

router.get('/Resulte/:id', auth, async (req, res) => {
    let data = await GetExamResulte(req.params.id)
    SuccessRespose({ res, message: "Exam Resulte", data })
})

router.post('/create', auth, async (req, res) => {
    let data = await CreateExam(req.body)
    SuccessRespose({ res, message: "Exam Created", data })
})

router.get('/resulte/student/:studentId', auth, async (req, res) => {
    let data = await GetStudentResulte(req.params.studentId)
    SuccessRespose({ res, message: "student resulte", data })
})


router.put('/Update/:id', auth, async (req, res) => {
    let data = await UpdateExam(req.body , req.params.id)
    SuccessRespose({ res, message: "student Updated", data })
})

//save Resulte in Exam Resule model
router.post('/resulte' , auth , async(req , res) =>{
    console.log(req.user)
    let data = await savResulte(req.body , req.user)
    SuccessRespose({ res, message: "student resulte saved", data })
})

router.get('/:examId/results/:studentId/audit' , auth , async(req , res) =>{
    console.log(req.user)
    let data = await GetResultAuditTrail(req.params.examId , req.params.studentId)
    SuccessRespose({ res, message: "Audit trail", data })
})

router.post('/:examId/absent/:studentId', auth,async (req, res) => {
    let data = await markAbcentStudent(req.params.examId, req.params.studentId, req.user)
    SuccessRespose({ res, message: "Student marked absent", data })
})


export default router