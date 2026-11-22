import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { GetAbsentReport, GetAttendanceReport, GetAttendanceTrendreport, GetDailyFinancials, GetEndOfDaySummary, GetExamReports, GetFeeTypeSummary, GetFinancialReport, GetFinancialReportsList, GetPaymentReport, GetStudentAbsenceDetail, SendDailyReport } from "./report.service.js";

const router = Router()

//DashBoard
router.get('/attendance', auth, async (req, res) => {
    let data = await GetAttendanceReport(req.query)
    SuccessRespose({ res, message: "Attendance Report", data })
})

router.get('/attendance/trend', auth, async (req, res) => {
    let data = await GetAttendanceTrendreport(req.query)
    SuccessRespose({ res, message: "Attendance Report", data })
})


router.get('/abcent', auth, async (req, res) => {
    let data = await GetAbsentReport(req.query)
    SuccessRespose({ res, message: "abcent Report", data })
})

router.get('/absence/student/:studentId', auth, async (req, res) => {
    let data = await GetStudentAbsenceDetail(req.params.studentId , req.query)
    SuccessRespose({ res, message: "Student absence detail", data })
})


router.get('/exam', auth, async (req, res) => {
    let data = await GetExamReports(req.query)
    SuccessRespose({ res, message: "Student absence detail", data })
})


router.get('/payment', auth, async (req, res) => {
    let data = await GetPaymentReport(req.query)
    SuccessRespose({ res, message: "Payment report", data })
})


router.get('/fee-type-summary', auth, async (req, res) => {
    let data = await GetFeeTypeSummary(req.query)
    SuccessRespose({ res, message: "Fee type summary", data })
})


router.get('/end-of-day', auth, Authorize('Administrator', 'Manager'), async (req, res) => {
    let data = await GetEndOfDaySummary(req.query)
    SuccessRespose({ res, message: "End of day summary", data })
})


router.get('/financial/daily', auth, async (req, res) => {
    let data = await GetDailyFinancials(req.query)
    SuccessRespose({ res, message: "Daily financials", data })
})


router.get('/financial', auth, async (req, res) => {
    let data = await GetFinancialReport(req.query)
    SuccessRespose({ res, message: "Financial report", data })
})

router.get('/financial/list', auth, async (req, res) => {
    let data = await GetFinancialReportsList(req.query)
    SuccessRespose({ res, message: "Financial reports list", data })
})

router.post('/send-daily', auth, Authorize('Administrator'), async (req, res) => {
    let data = await SendDailyReport(req.body, req.user)
    SuccessRespose({ res, message: "Daily report sent", data })
})

export default router