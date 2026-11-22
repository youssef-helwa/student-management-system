import { Router } from "express";
import { SuccessRespose } from "../../common/response/success.response.js";
import { FindStudentBymanully, FindStudentByQr, GetAttendanceRecords, GetAttendanceRecordsAll, GetDayType, RecordAttendance, SetDayType } from "./attendance.service.js";
import { auth } from "../../common/middleware/auth/auth.js";


const router = Router()

router.get('/All', auth, async (req, res) => {
    let data = await GetAttendanceRecordsAll()
    SuccessRespose({ res, message: "Attendance records All", data })
})

router.get('/search', auth, async (req, res) => {
    let data = await GetAttendanceRecords(req.query)
    SuccessRespose({ res, message: "Attendance records", data })
})

router.get('/qr/:qrCode', auth, async (req, res) => {
    let data = await FindStudentByQr(req.params.qrCode)
    SuccessRespose({ res, message: "Student found", data })
})

router.post('/record', auth,async (req, res) => {
    let data = await RecordAttendance(req.body, req.user)
    SuccessRespose({ res, message: "Attendance recorded", status: 201, data })
})

router.get('/code/:studentCode', auth, async (req, res) => {
    let data = await FindStudentBymanully(req.params.studentCode)
    SuccessRespose({ res, message: "Student found", data })
})


router.get('/day-type', auth, async (req, res) => {
    let data = await GetDayType(req.query)
    SuccessRespose({ res, message: "Attendance records All", data })
})

router.post('/day-type', auth, async (req, res) => {
    let data = await SetDayType(req.body)
    SuccessRespose({ res, message: "Attendance day type updated", data })
})

export default router
