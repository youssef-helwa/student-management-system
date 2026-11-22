import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { AttRecordModel } from "../../database/model/AttendanceRecored.model.js"
import { StudentModel } from "../../database/model/Students.model.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { NotificationModel } from "../../database/model/Notification.model.js"
import { PaymentModel } from "../../database/model/payment.model.js"
import { SessionModel } from "../../database/model/session.model.js"
import { GradesModel } from "../../database/model/Grads.model.js"
import { AttendanceDayModel } from "../../database/model/AttendanceDay.model.js";
import { PaymentHistoryModel } from "../../database/model/paymentHistory.model.js"

export const GetAttendanceRecordsAll = async() =>{
    let att = await AttRecordModel.findAll({
        include: [{ model: StudentModel, as: "student" ,
            include:[{model:PaymentModel , as:"payments"}] 
    }]})

    return att
}


export const GetAttendanceRecords = async ({ branchId, gradeId, date } = {}) => {

    
    let where = {}
    if (branchId) where.branchId = branchId
    if (gradeId && gradeId !== "all") where.gradeId = gradeId
    if (date) where.date = date

    return await AttRecordModel.findAll({
        where,
        include: [{ model: StudentModel, as: "student" ,
            include:[{model:PaymentModel , as:"payments"}] 
        }],
        order: [["date", "DESC"]]
    })
}


export const RecordAttendance = async ({studentId,studentCode, qrCode, method, status ,sessionId ,dayType  }, userId) => {
    let student 

    if (studentId) {
    student = await StudentModel.findByPk(studentId);
    }
    //manually
    if(studentCode){
        student = await StudentModel.findOne({where:{studentCode}})
    }
    //Qr
    if(qrCode){
        student = await StudentModel.findOne({where:{qrCode}})
    }

    if(!student){
        return BadRequestExeption({message:"student not found"})
    }

    if(student.status !== "active"){
        return BadRequestExeption({message: "Student is inactive and cannot record attendance"})
    }
      // Check session
    const today = new Date().toISOString().split("T")[0] 
    const session = await SessionModel.findOne({
        where : {classId : student.classId , date : today}
    })
    if (!session) {
        return NotFoundExeption({message: "Session not found"})
    }

    const existing = await AttRecordModel.findOne({ where: {
        studentId : student.id,
        classId: student.classId,
        date: today } })
    //if student present 
    if (existing && existing.status === "present") {
        return BadRequestExeption({ message: "Attendance already recorded for this student today" })
    }

    //if(student is absent and need to convert to present)
    if(existing && existing.status === "absent") {
        const checkInTime = new Date().toTimeString().slice(0 , 8)

        await existing.update({
            status : "present",
            method : method || "manual",
            checkInTime
        })
        await student.update({
            lastLogin : new Date()
        })
        await logActivity({
            action: "attendance_recorded",
            userId,
            branchId: student.branchId,
            detail: `Late attendance recorded for ${student.fullName}`
        })

        return existing
    }

    //calculate money
    const grade = await GradesModel.findByPk(student.gradeId)
    if(!grade) {
        return NotFoundExeption({message:"Grade Not Found"})
    }

    let fee = Number(grade.sessionFee)
    if (student.feeType === "half") {
    fee = fee / 2
}

if (student.feeType === "exempted") {
    fee = 0
}


    
    const checkInTime = new Date().toTimeString().slice(0, 8)

    const record = await AttRecordModel.create({
        date: session.date,
        status:"present",
        method: method || "manual",
        checkInTime,
        amount:fee,
        classId: student.classId,
        branchId: student.branchId,
        gradeId: student.gradeId,
        studentId: student.id,
        sessionId: session.id,
        dayType: dayType || "regular"
        
    })

    const payment = await PaymentModel.create({
    studentId: student.id,
    totalFee: fee,
    paidAmount: fee,
    remainingBalance: 0,
    status: fee === 0 ? "exempted" : "paid"
    });

    await PaymentHistoryModel.create({
    date: session.date,
    amount: fee,
    paymentId: payment.id
    });

    await student.update({
    lastLogin: new Date()
    });

    await logActivity({ action: "attendance_recorded", userId , branchId: student.branchId, detail: `Attendance recorded for ${student.fullName}` })

    return record
}

// Resolve a student by their QR token — used by QR-scan attendance flows.
export const FindStudentByQr = async (qrCode) => {
    const student = await StudentModel.findOne({ where: { qrCode } })
    if (!student) return NotFoundExeption({ message: "No student matches this QR code" })
    return student
}


export const FindStudentBymanully = async(studentCode)=>{
    let student = await StudentModel.findOne({where : {studentCode}})
    if(!student){
        return NotFoundExeption({message :"No student matches this QR code"})
    }
    return student
}


export const GetDayType = async ({ branchId, date } = {}) => {

    if (!branchId) {
        return BadRequestExeption({
            message: "branchId is required"
        });
    }

    if (!date) {
        return BadRequestExeption({
            message: "date is required"
        });
    }

    const session = await SessionModel.findOne({
        where: {
            branchId,
            date
        },
        order: [["startedAt", "DESC"]]
    });

    // No session for this date
    if (!session) {
        return {
            date,
            branchId,
            dayType: "regular",
            session: null
        };
    }

    // Get attendance record to determine day type
    const attendance = await AttRecordModel.findAll({
        where: {
            branchId,
            date,
            sessionId: session.id
        },
        order: [["createdAt", "DESC"]]
    });
    return {
        date,
        branchId,
        sessionId: session.id,
        dayType: attendance?.dayType || "regular",
        session
    };
};


export const SetDayType = async (data) => {
    let { branchId, date, dayType } = data

    if (!branchId) {
        return BadRequestExeption({
            message: "branchId is required"
        });
    }

    if (!date) {
        return BadRequestExeption({
            message: "date is required"
        });
    }

    if (!["regular", "exam"].includes(dayType)) {
        return BadRequestExeption({
            message: "dayType must be regular or exam"
        });
    }

    const [day, created] = await AttendanceDayModel.findOrCreate({
        where: {
            branchId,
            date
        },
        defaults: {
            branchId,
            date,
            dayType
        }
    });

    if (!created) {
        await day.update({
            dayType
        });
    }

    return day;
};