import { Op, where } from "sequelize"
import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { AttRecordModel } from "../../database/model/AttendanceRecored.model.js"
import { ExamModel } from "../../database/model/Exam.Model.js"
import { ExamResultModel } from "../../database/model/ExamResult.model.js"
import { StudentModel } from "../../database/model/Students.model.js"
import { PaymentHistoryModel } from "../../database/model/paymentHistory.model.js"
import { PaymentModel } from "../../database/model/payment.model.js"
import { ExpenseModel } from "../../database/model/Expense.model.js"
import { BranchModel } from "../../database/model/Branch.model.js"
import { UserModel } from "../../database/model/user.model.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { sendEmail } from "../../common/utils/SentEmail/SentEmail.js"
import { ClassModel } from "../../database/model/class.model.js"
import { GradesModel } from "../../database/model/Grads.model.js"




const todayString = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Cairo"
    });
};

export const GetAttendanceReport = async (query) => {

    const { branchId } = query || {};

    const where = {};

    if (branchId) {
        where.branchId = branchId;
    }

    const records = await AttRecordModel.findAll({
        where,
        order: [["createdAt", "ASC"]]
    });

    const result = [];

    records.forEach((record) => {

        const date = record.date;

        let day = result.find((item) => item.date === date);

        if (!day) {
            day = {
                date: date,
                present: 0,
                absent: 0,
                excused: 0
            };

            result.push(day);
        }

        if (record.status === "present") {
            day.present++;
        }

        if (record.status === "absent") {
            day.absent++;
        }

        if (record.status === "excused") {
            day.excused++;
        }
    });

    return result;
};


export const GetAttendanceTrendreport = async ({ branchId } = {}) => {
    const where = {};

    if (branchId) {
        where.branchId = branchId;
    }

    const records = await AttRecordModel.findAll({
        where,
        order: [["date", "ASC"]],
    });

    const grouped = {};

    for (const record of records) {
        const date = record.date;

        if (!grouped[date]) {
            grouped[date] = {
                date,
                present: 0,
                absent: 0,
                excused: 0,
            };
        }

        if (record.status === "present") {
            grouped[date].present++;
        } else if (record.status === "absent") {
            grouped[date].absent++;
        } else if (record.status === "excused") {
            grouped[date].excused++;
        }
    }

    return Object.values(grouped);
};


export const GetAbsentReport = async (query) => {
    const { branchId } = query || {};

    // Current month
    const today = new Date();

    const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const startDate = startOfMonth.toISOString().slice(0, 10);
    const endDate = today.toISOString().slice(0, 10);

    const where = {
        status: "absent",
        date: {
            [Op.between]: [startDate, endDate]
        }
    };

    if (branchId) {
        where.branchId = branchId;
    }

    const absents = await AttRecordModel.findAll({
        where,
        include: [
            {
                model: StudentModel,
                as: "student"
            }
        ],
        order: [["date", "DESC"]]
    });

    const ByStudent = {};

    for (const record of absents) {
        const key = record.studentId;

        if (!ByStudent[key]) {
            ByStudent[key] = {
                studentId: key,
                student: record.student,
                absences: 0,
                lastAbsenceDate: record.date
            };
        }

        // Count absence in current month
        ByStudent[key].absences++;

        if (record.date > ByStudent[key].lastAbsenceDate) {
            ByStudent[key].lastAbsenceDate = record.date;
        }
    }

    return Object.values(ByStudent);
};



export const GetStudentAbsenceDetail = async(studentId , query) =>{
    const student = await StudentModel.findByPk(studentId)
    if(!student) return NotFoundExeption({message :"student not found"})
    let {branchId} = query || {}

    const where  = {studentId}
    if(branchId) where.branchId = branchId

    const records = await AttRecordModel.findAll({where , order: [["date", "DESC"]] })
    const absentrecords = records.filter((s) => s.status === "absent")
    
    const totalRecords = records.length
    const presentStudent = records.filter((s) => s.status === "present")

    return {
        studentId,
        studentName :student.fullName,
        studentCode : student.studentCode,
        totalAbsences : absentrecords.length,
        lastAbsentsDate : absentrecords.length ? absentrecords[0].date : null,
        AbsentsDate : absentrecords.map((s) => s.date),
        attendaceRate : totalRecords ? Number(((presentStudent.length /totalRecords) *100 ).toFixed(2) ) : 0
    }
}


export const GetExamReports = async(query) =>{
    let {branchId} = query
    let where = {status: "completed"}
    if(branchId) where.branchId = branchId
    let exams = await ExamModel.findAll({where})
    let examsIds = exams.map((e) => e.id)

    const results = await ExamResultModel.findAll({where : {examId: {[Op.in]: examsIds}}})

    const preExam = exams.map((exam =>{
        const examResult = results.filter((r) => r.examId == exam.id && r.absent === false)
        let TotalScore = 0
        for(const result of examResult){
            TotalScore = TotalScore + Number(result.score)
        }
        const avg = examResult.length > 0 ? TotalScore / examResult.length : 0

        return {
            examId : exam.id,
            examName : exam.name,
            averageScore : Number(avg.toFixed(2)),
            participantCount : examResult.length,
            absentCount : results.filter((r) => r.examId === exam.id && r.absent === true).length
        }
    }))
    return preExam
}


export const GetPaymentReport = async (query) => {
    let { branchId } = query || {}
    const where = {}
    if (branchId) where.branchId = branchId

    const payments = await PaymentModel.findAll({
        include: [{ model: StudentModel, as: "student", where, required: true }]
    })

    return payments.map((p) => ({
        studentId: p.student.id,
        studentName: p.student.fullName,
        totalFee: Number(p.totalFee),
        paidAmount: Number(p.paidAmount),
        remainingBalance: Number(p.remainingBalance),
        status: p.status
    }))
}


export const GetFeeTypeSummary = async (query) =>{

    let {branchId , gradeId , classId} = query || {}
    const where = {}
    if(branchId) where.branchId = branchId
    if(gradeId) where.gradeId = gradeId
    if(classId) where.classId = classId

    let student = await StudentModel.findAll({
        where ,
        attributes :["id" , "feeType"]
    })

    let FullFee = student.filter((s) => s.feeType === "full").length
    let halfFee = student.filter((s) => s.feeType === "half").length
    let exemptedFee = student.filter((s) => s.feeType === "exempted").length

    return {
        fullFee:FullFee,
        halfFee,
        exempted:exemptedFee,
        totalStudent : student.length
    }
}

// GET /reports/end-of-day?branchId=&date=
export const GetEndOfDaySummary = async (query) => {
    const { branchId, gradeId , classId, date } = query || {};

    // IMPORTANT:
    // Use Egypt/local date instead of UTC date
    const TargetDate =
        date || new Date().toLocaleDateString("en-CA", {
            timeZone: "Africa/Cairo"
        });

    // =========================================
    // 1. STUDENTS
    // =========================================

    const studentWhere = {};

    if (branchId) {
        studentWhere.branchId = branchId;
    }

    const students = await StudentModel.findAll({
        where: studentWhere
    });

    const StudentIds = students.map((s) => s.id);

// =========================================
// 2. ATTENDANCE TODAY
// =========================================

const AttWhere = {
    date: TargetDate
};

if (branchId) {
    AttWhere.branchId = branchId;
}
if (gradeId) AttWhere.gradeId = gradeId
if (classId) AttWhere.classId = classId

const attendance = await AttRecordModel.findAll({
    where: AttWhere
});

// Students who actually attended
const presentStudentIds = new Set(
    attendance
        .filter(record => record.status === "present")
        .map(record => record.studentId)
);

// Students who were manually marked absent
const absentStudentIds = new Set(
    attendance
        .filter(record => record.status === "absent")
        .map(record => record.studentId)
);

const present = presentStudentIds.size;

// IMPORTANT:
// A student is absent if he belongs to the branch
// but does NOT have a present attendance record today.

const absent = students.filter(
    student => !presentStudentIds.has(student.id)
).length;
    // =========================================
    // 3. PAYMENTS TODAY
    // =========================================

    let paymentsToday = [];

    if (StudentIds.length > 0) {
        paymentsToday = await PaymentHistoryModel.findAll({
            where: {
                date: TargetDate
            },
            include: [
                {
                    model: PaymentModel,
                    as: "Payment",
                    required: true,
                    where: {
                        studentId: {
                            [Op.in]: StudentIds
                        }
                    }
                }
            ]
        });
    }

    // =========================================
    // 4. TOTAL COLLECTED TODAY
    // =========================================

    const collect = paymentsToday.reduce(
        (sum, history) => sum + Number(history.amount || 0),
        0
    );

    // =========================================
    // 5. STUDENTS WHO PAID TODAY
    // =========================================

    const PaidStudentIds = new Set(
        paymentsToday
            .map((history) => history.Payment?.studentId)
            .filter(Boolean)
    );

    const PaidStudents = PaidStudentIds.size;

    // =========================================
    // 6. FEE EXEMPTED STUDENTS
    // =========================================

    const exemptedStudents = students.filter(
        (student) => student.feeType === "exempted"
    ).length;

    // =========================================
    // 7. STUDENTS WHO ATTENDED BUT DID NOT PAY
    // =========================================

    const attendedStudents = new Set([
        ...presentStudentIds
    ]);

    const unpaidStudents = [...attendedStudents].filter(
        (studentId) => !PaidStudentIds.has(studentId)
    ).length;

    // =========================================
    // 8. EXPECTED MONEY TODAY
    // =========================================
    
    // Since every attendance = one session fee
    // calculate expected money from today's attendance.

    const expected = attendance
        .filter((record) => record.status === "present")
        .reduce(
            (sum, record) => sum + Number(record.amount || 0),
            0
        );

    // =========================================
    // 9. REMAINING BALANCE TODAY
    // =========================================

    const remainingBalance = Math.max(
        expected - collect,
        0
    );

    // =========================================
    // 10. EXAMS TODAY
    // =========================================

    const ExamWhere = {
        date: TargetDate
    };

    if (branchId) {
        ExamWhere.branchId = branchId;
    }

    const examsToday = await ExamModel.count({
        where: ExamWhere
    });

    // =========================================
    // FINAL RESULT
    // =========================================

    return {
        date: TargetDate,
        totalAttended: present,
        totalAbsent: absent,
        totalCollected: collect,
        totalExpected: expected,
        remainingBalance,
        paidStudents: PaidStudents,
        unpaidStudents,
        exemptedStudents,
        examsConducted: examsToday
    };
}


const dayRange = (dateStr) => {
    const start = new Date(`${dateStr}T00:00:00.000Z`)
    const end = new Date(`${dateStr}T23:59:59.999Z`)
    return { start, end }
}


// to know the incoming money for the day and what is our expenses
const financialsForDay = async ({branchId, gradeId , classId , dateStr}) =>{
    let studentwhere = {}
    if(branchId) studentwhere.branchId = branchId
    if(gradeId) studentwhere.gradeId = gradeId
    if(classId) studentwhere.classId = classId

    let students = await StudentModel.findAll({where : studentwhere , attributes : ["id"]})
    let studentIds = students.map((s) => s.id)

    let income = await PaymentHistoryModel.findAll({
        where : {date : dateStr} , 
        include : [{
            model : PaymentModel,
            as : "Payment",
            where: {studentId : {[Op.in] : studentIds}}
        }]
    })
    
    const {start , end} = dayRange(dateStr)
    const expenseWhere = {createdAt : {[Op.between] : [start , end]}}
    if(branchId) expenseWhere.branchId = branchId
    const expenses = await ExpenseModel.findAll( {where : expenseWhere})
    return  {income , expenses}
}

export const GetDailyFinancials = async ({ branchId , gradeId , classId, date } = {}) => {
    const dateStr = date || todayString()
    const { income, expenses } = await financialsForDay({ branchId , gradeId , classId, dateStr })

    const totalIncome = income.reduce((sum, h) => sum + Number(h.amount), 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        date: dateStr,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        totalTransactions: income.length
    }
}



export const GetFinancialReport = async(query) => {
    let {branchId, gradeId, classId, date, generatedBy } = query

    const dateStr = date || todayString()

    const {income , expenses} = await financialsForDay({branchId , gradeId , classId , dateStr})

    const TotalIncoming = income.reduce((sum , h) => sum + Number(h.amount) , 0)

    const TotleEXpenses = expenses.reduce((sum , h) => sum + Number(h.amount) , 0)

    const StudentWhoPaidIds = new Set(income.map((s) => s.Payment.studentId))
    const StudentWhoPaid = StudentWhoPaidIds.size

    let PaymentMethodBreakdown = {}
    income.forEach((h) => {
        PaymentMethodBreakdown[h.method] = ( PaymentMethodBreakdown[h.method] || 0) + Number(h.amount)
    })

    let Attwhere = {date : dateStr , status : "present"}
    if(branchId) Attwhere.branchId = branchId
    if(gradeId) Attwhere.gradeId = gradeId
    if(classId) Attwhere.classId = classId
    
    let AttOnDate = await AttRecordModel.findAll({
        where : Attwhere,
        include :[{model : StudentModel , as : "student"}]
    })

    const attendedStudentIds = new Set(AttOnDate.map((r) => r.studentId))
    const totalStudents = attendedStudentIds.size

    const TotalFeeExepted = AttOnDate.filter((s) => s.student?.feeType === "exempted").length

    let BranchName = "All Branches";
let GradeName = "All Grades";
let ClassName = "All Classes";

if (branchId) {
    const branch = await BranchModel.findByPk(branchId);
    BranchName = branch?.name || BranchName;
}

if (gradeId) {
    const grade = await GradesModel.findByPk(gradeId);
    GradeName = grade?.name || GradeName;
}

if (classId) {
    const classItem = await ClassModel.findByPk(classId);
    ClassName = classItem?.name || ClassName;
}

    return {
        date: dateStr,
        branchId: branchId || null,
        BranchName,
        GradeName,
        ClassName,
        generatedTime: new Date().toISOString(),
        generatedBy: generatedBy || "System",
        incomeSummary: {
            transactionCount: income.length,
            studentsWhoPaid: StudentWhoPaid,
            totalIncome: TotalIncoming
        },
        expenseSummary: {
            totalExpenses:TotleEXpenses,
            items: expenses
                .slice()
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((e) => ({
                    id: e.id,
                    category: e.category,
                    description: e.description,
                    amount: Number(e.amount),
                    createdBy: e.createdBy,
                    time: e.createdAt
                }))
        },
        
        financialSummary: {
            totalIncome: TotalIncoming,
            totalExpenses: TotleEXpenses,
            approvedExpenses: TotleEXpenses,
            netCash: TotalIncoming - TotleEXpenses
        },
        
        paymentMethodBreakdown: PaymentMethodBreakdown,
        
        studentFeeSummary: await GetFeeTypeSummary({ branchId , gradeId ,classId }),
        
        attendanceSummary: {
            totalStudentsAttended: totalStudents,
            totalFeeExemptedAttended: TotalFeeExepted
        },
        dailyActivitySummary: {
            totalStudentsPaid: StudentWhoPaid,
            totalPaymentTransactions: income.length,
            totalExpenses: expenses.length,
            totalStudentsAttended: attendedStudentIds.size,
            totalFeeExemptedAttended : TotalFeeExepted
        }
    }
}


export const GetFinancialReportsList = async ({branchId,from,to} = {}) => {

    // Get students for the selected branch
    const studentWhere = {}
    if (branchId) studentWhere.branchId = branchId

    const students = await StudentModel.findAll({
        where: studentWhere,
        attributes: ["id"]
    })
    const studentIds = students.map((s) => s.id)
    if (studentIds.length === 0) {
        return []
    }
    const paymentWhere = {}
    if (from || to) {
        paymentWhere.date = {}
        if (from) {
            paymentWhere.date[Op.gte] = from
        }
        if (to) {
            paymentWhere.date[Op.lte] = to
        }
    }

    // Get payment dates
    const incomeDates = await PaymentHistoryModel.findAll({
        where: paymentWhere,
        include: [{
            model: PaymentModel,
            as: "Payment",
            required: true,
            where: {
                studentId: {
                    [Op.in]: studentIds
                }
            }
        }],
        attributes: ["date"]
    })

    // Expense date filter
    const expenseWhere = {}

    if (branchId) {
        expenseWhere.branchId = branchId
    }

    if (from || to) {
        expenseWhere.createdAt = {}

        if (from) {
            expenseWhere.createdAt[Op.gte] =
                new Date(`${from}T00:00:00.000Z`)
        }

        if (to) {
            expenseWhere.createdAt[Op.lte] =
                new Date(`${to}T23:59:59.999Z`)
        }
    }

    // Get expense dates
    const expenseDates = await ExpenseModel.findAll({
        where: expenseWhere,
        attributes: ["createdAt"]
    })

    // Combine payment dates and expense dates
    const dateSet = new Set()

    incomeDates.forEach((payment) => {
        dateSet.add(String(payment.date))
    })

    expenseDates.forEach((expense) => {
        if (expense.createdAt) {
            dateSet.add(
                expense.createdAt
                    .toISOString()
                    .slice(0, 10)
            )
        }
    })

    // Newest date first
    const dates = [...dateSet].sort(
        (a, b) => b.localeCompare(a)
    )

    // Generate daily reports
    return Promise.all(
        dates.map((date) =>
            GetDailyFinancials({
                branchId,
                date
            })
        )
    )
}








const money = (n) => `EGP ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const buildReportEmailHtml = (report) => {
    const feeRow = (label, value) => `<li style="font-size:14px;margin-bottom:4px;">${label}: <strong>${value}</strong></li>`

    const methodRows = Object.entries(report.paymentMethodBreakdown || {})
    const methodsHtml = methodRows.length
        ? methodRows.map(([method, amount]) => feeRow(method, money(amount))).join("")
        : `<li style="font-size:14px;color:#6b7280;">No payments recorded.</li>`

    const expenseItems = report.expenseSummary?.items || []
    const expensesHtml = expenseItems.length
        ? expenseItems.map((e) => `<li style="font-size:14px;margin-bottom:4px;">${e.category} — ${e.description}: <strong>${money(e.amount)}</strong></li>`).join("")
        : `<p style="font-size:14px;color:#6b7280;">No expenses recorded.</p>`

    return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
        <h2 style="margin-bottom:4px;">Daily Financial Report</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0;">${report.BranchName} · ${report.GradeName} · ${report.ClassName} · ${report.date}</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Total Payments Collected</td>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Total Expenses</td>
            </tr>
            <tr>
                <td style="padding:0 0 12px 0;font-weight:700;">${money(report.financialSummary.totalIncome)}</td>
                <td style="padding:0 0 12px 0;font-weight:700;">${money(report.financialSummary.totalExpenses)}</td>
            </tr>
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Net Total (Payments − Expenses)</td>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Payment Transactions</td>
            </tr>
            <tr>
                <td style="padding:0 0 12px 0;font-weight:700;">${money(report.financialSummary.netCash)}</td>
                <td style="padding:0 0 12px 0;font-weight:700;">${report.incomeSummary.transactionCount}</td>
            </tr>
            <tr>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Total Students Attended</td>
                <td style="padding:8px 0;font-size:13px;color:#6b7280;">Fee-Exempted Students Attended</td>
            </tr>
            <tr>
                <td style="font-weight:700;">${report.attendanceSummary.totalStudentsAttended}</td>
                <td style="font-weight:700;">${report.attendanceSummary.totalFeeExemptedAttended}</td>
            </tr>
        </table>

        <h4 style="font-size:14px;margin-bottom:8px;">Student Fee Summary</h4>
        <ul style="padding-left:18px;margin:0 0 16px 0;">
            ${feeRow("Full Fee", report.studentFeeSummary.fullFee || 0)}
            ${feeRow("Half Fee", report.studentFeeSummary.halfFee || 0)}
            ${feeRow("Exempted", report.studentFeeSummary.exempted || 0)}
        </ul>

        <h4 style="font-size:14px;margin-bottom:8px;">Payment Method Breakdown</h4>
        <ul style="padding-left:18px;margin:0 0 16px 0;">${methodsHtml}</ul>

        <h4 style="font-size:14px;margin-bottom:8px;">Expense Details</h4>
        <ul style="padding-left:18px;margin:0 0 16px 0;">${expensesHtml}</ul>

        <p style="font-size:12px;color:#9ca3af;">
            Report generated ${new Date(report.generatedTime).toLocaleString("en-GB")} by ${report.generatedBy}.
        </p>
    </div>`
}

// Center Owner = Administrator (all branches). Branch Managers = Manager role,
// scoped to the report's branch when one is given, otherwise every manager.
const getReportRecipients = async ({ branchId }) => {
    const managerWhere = { role: "Manager", status: "active" }
    if (branchId) managerWhere.branchId = branchId

    const [admins, managers] = await Promise.all([
        UserModel.findAll({ where: { role: "Administrator", status: "active" }, attributes: ["email"] }),
        UserModel.findAll({ where: managerWhere, attributes: ["email"] })
    ])

    return [...new Set([...admins, ...managers].map((u) => u.email).filter(Boolean))]
}

// POST /reports/send-daily — renders the Daily Financial Report and emails it
// to the Center Owner + Branch Managers. Mirrors financialService.sendDailyReport.
export const SendDailyReport = async ({ branchId, gradeId, classId, date }, userId) => {
    const dateStr = date || todayString()

    const actor = userId ? await UserModel.findByPk(userId) : null
    const report = await GetFinancialReport({
    branchId,
    gradeId,
    classId,
    date: dateStr,
    generatedBy: actor?.fullName || "System"
})

    const recipients = await getReportRecipients({ branchId })
    if (recipients.length === 0) {
        return BadRequestExeption({ message: "No Administrator/Manager with an email address was found to send this report to." })
    }

    const subject = `Daily Financial Report – ${report.BranchName} – ${report.GradeName} – ${report.ClassName} – ${dateStr}`

    await logActivity({
        action: "daily_report_generated",
        userId: userId,
        branchId,
        detail: `Generated the Daily Financial Report for ${report.BranchName} — ${dateStr}`
    })

    await sendEmail({ to: recipients.join(","), subject, html: buildReportEmailHtml(report) })

    await logActivity({
        action: "daily_report_sent",
        userId: userId,
        branchId,
        detail: `Sent the Daily Financial Report for ${report.BranchName} — ${dateStr} to the center owner and managers`
    })

    return { success: true, sentAt: new Date().toISOString(), recipients }
}
