import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { AttRecordModel } from "../../database/model/AttendanceRecored.model.js"
import { ClassModel } from "../../database/model/class.model.js"
import { SessionModel } from "../../database/model/session.model.js"
import { StudentModel } from "../../database/model/Students.model.js"
import { NotificationModel } from "../../database/model/Notification.model.js"





export const StartSession = async(data , userId)=>{
    let {date , status , startedAt , startedBy , classId , gradeId , branchId} = data || {}
    if(!classId){
        return BadRequestExeption({message :"class is required"})
    }
    
    const cls = await ClassModel.findByPk(classId)
    if(!cls){
        return NotFoundExeption({message :"Class Not Found"})
    }
    const today = new Date().toISOString().slice(0, 10);

    let session  = await SessionModel.findOne({where :{classId , date : today}})
    if(session){
        session.status = "open"
        session.startedAt = new Date();
        session.startedBy = userId;

        await session.save();

        return session;
    }

    session = await SessionModel.create({
        date : new Date().toISOString().slice(0 , 10),
        status : "open",
        startedAt: new Date(),
        startedBy: userId,
        gradeId: cls.gradeId,
        branchId:cls.branchId,
        classId
    })
    await logActivity({action:"Start session",userId , branchId:cls.branchId , detail:`Started attendance session for class #${classId}`})
    return session
}


export const GetActiveSessionForClass = async (classId) => {
    const session = await SessionModel.findOne({
        where: { classId, status: "open" },
        include: [{ model: ClassModel, as: "class" }],
        order: [["startedAt", "DESC"]]
    })
    return session || null
}

export const GetSessionById = async (sessionId , userId)=>{
    const session = await SessionModel.findByPk(sessionId, {include :[{model:ClassModel,as:"class"}]})
    if(!session){
        return NotFoundExeption({message: "session Not found"})
    }
    return session
}

export const closedSession = async (sessionId, userId) => {

    const session = await SessionModel.findByPk(sessionId)

    if (!session) {
        return BadRequestExeption({
            message: "no session found"
        })
    }

    if (session.status === "closed") {
        return BadRequestExeption({
            message: "session Already Closed"
        })
    }

    // Get all active students in this class
    const Classstudent = await StudentModel.findAll({
        where: {
            classId: session.classId,
            status: "active"
        }
    })

    // Get ALL attendance records for this session
    const AttendanceRecords = await AttRecordModel.findAll({
        where: {
            sessionId
        }
    })

    // Students that already have an attendance record
    const recordedStudentIds = AttendanceRecords.map(
        (record) => record.studentId
    )

    // Students that are present
    const presentStudentIds = AttendanceRecords
        .filter((record) => record.status === "present")
        .map((record) => record.studentId)

    // Only students that have NO attendance record
    // will become absent
    const absentStudents = Classstudent.filter(
        (student) => !recordedStudentIds.includes(student.id)
    )

    // Create absent record only for students
    // who don't have any attendance record
    for (const student of absentStudents) {

        await AttRecordModel.create({
            date: session.date,
            status: "absent",
            method: "manual",
            classId: session.classId,
            gradeId: session.gradeId,
            branchId: session.branchId,
            studentId: student.id,
            sessionId: session.id
        })

        await NotificationModel.create({
            type: "absence",
            title: "studentAbsent",
            message: `${student.fullName} didn't attend the last session`,
            branchId: session.branchId,
            classId: session.classId,
            studentId: student.id,
            severity: "warning",
            read: false
        })
    }

    // Close session
    session.status = "closed"
    session.closedAt = new Date()
    session.closedBy = userId

    await session.save()

    await logActivity({
        action: "session_closed",
        userId,
        branchId: session.branchId,
        detail: `Closed session #${session.id} — ${presentStudentIds.length} present, ${absentStudents.length} absent`
    })

    return {
        session,

        presentCount: presentStudentIds.length,

        absentCount: absentStudents.length,

        absentStudents: absentStudents.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            code: s.studentCode
        }))
    }
}


export const GetSessionAttendance = async (id) => {
    const session = await SessionModel.findByPk(id)
    if (!session) return NotFoundExeption({ message: "Session not found" })

    return await AttRecordModel.findAll({
        where: { sessionId: id },
        include: [{ model: StudentModel, as: "student" }],
        order: [["checkInTime", "ASC"]]
    })
}