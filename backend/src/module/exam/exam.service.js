import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { ExamModel } from "../../database/model/Exam.Model.js"
import { ExamResultModel } from "../../database/model/ExamResult.model.js"
import { NotificationModel } from "../../database/model/Notification.model.js"
import { StudentModel } from "../../database/model/Students.model.js"
import {logActivity} from '../../common/utils/LogActivity.js'
import { ExamResultAuditModel } from "../../database/model/ExamResultAudit.model.js"



export const AllExams = async()=>{
    let exams = await ExamModel.findAll()
    return exams
}


export const GetExams = async ({ branchId, gradeId, status } = {}) => {
    let where = {}
    if (branchId) where.branchId = branchId
    if (gradeId) where.gradeId = gradeId
    if (status) where.status = status
    return await ExamModel.findAll({ where, order: [["date", "DESC"]] })
}


export const GetExamId = async(id)=>{
    let exam = await ExamModel.findByPk(id)
    if(!exam) return NotFoundExeption({message : "Exam Not Found"})
    return exam
}


export const CreateExam = async(data) =>{
    if(!data) return BadRequestExeption({message: "please Enter The Data"})
    let {name , subject , totalMarks  ,gradeId , branchId , date , status} = data
    const exam = await ExamModel.create({name , subject , totalMarks  ,gradeId , branchId , date , status : status || "upcoming"})
    if(exam.status === "upcoming"){
        await NotificationModel.create({
        type: `Exam`,
        title: "New Exam Scheduled",
        message: `${exam.name} is scheduled for ${exam.gradeId} on ${date}.`,
        branchId : exam.branchId,
        severity: "info"
    })
    }
    return exam
}


export const GetStudentResulte = async(studentId) =>{
    let studentResult = await ExamResultModel.findOne({
        where:{studentId},
        include:[{model: ExamModel , as : "exam"}]
    })
    return studentResult
}


export const UpdateExam = async (data,examId) =>{
    let {name , subject , gradeId ,totalMarks ,date} =data
    let exam = await ExamModel.findByPk(examId)
    if(!exam) return NotFoundExeption({message :"no exam found"})

    await exam.update({name , subject , gradeId ,totalMarks ,date})
    return exam
}


export const GetExamResulte = async(examId)=>{
    let exam = await ExamModel.findByPk(examId);
    if (!exam) {
        return NotFoundExeption({message: "Exam Not Found"});
    }

    let Resulte = await ExamResultModel.findAll({
        where : {examId} ,
        include:[{model : StudentModel , as:'student'}]
    })
    if (Resulte.length === 0) {
        return NotFoundExeption({message: "No results found for this exam"});
    }
    return Resulte
}

export const GetAllResulte = async() =>{
    let results = await ExamResultModel.findAll({
        include :[
            {model : StudentModel , as :"student"},
            {model : ExamModel , as :"exam"}
        ] 
    })
    return results
}



export const savResulte = async(data , userId) =>{
    let {examId , studentId ,score , absent} = data || {}
    let exam = await ExamModel.findByPk(examId)
    if(!exam) return NotFoundExeption({message :" No Exam Found"})
        
    let student = await StudentModel.findByPk(studentId)
    if(!student) return NotFoundExeption({message :" No Student Found"})

    if (student.branchId !== exam.branchId) {
    return BadRequestExeption({message: "This student does not belong to this exam's branch."});
    }
            
    if (student.gradeId !== exam.gradeId) {
        return BadRequestExeption({message: "This student does not belong to this exam's grade."});
    }

    const numericScore = Number(score);
    if(!absent){
        if(score === undefined || score === null || score === ""){
            return BadRequestExeption({message: "Score is required"})
        }
        if (!Number.isFinite(numericScore)) {
            return BadRequestExeption({message: "Score must be a valid number"});
        }
        if (numericScore > Number(exam.totalMarks)) {
            return BadRequestExeption({message: `Score cannot be greater than ${exam.totalMarks}`});
        }
    }
    
    let existResulte = await ExamResultModel.findOne({where : {examId , studentId}})
    if(existResulte){
        return ConflictExeption({message :"Resulte Already Exist"})
    }
    const resulte = await ExamResultModel.create({examId , studentId ,score : absent? null : Number(score) , absent: Boolean(absent)})
    // if (exam.status === "upcoming") {
    //     exam.status = "completed";
    //     await exam.save();
    // }
    
    await logActivity({
        action: "exam_result_added",
        userId,
        branchId: exam.branchId,
        detail: `${student.fullName} - ${exam.name}`
    });

    const totalStudents = await StudentModel.count({
        where: {
            gradeId: exam.gradeId,
            branchId: exam.branchId
        }
    });
    const totalResults = await ExamResultModel.count({
        where: {
            examId
        }
    });

    if (totalStudents > 0 && totalResults >= totalStudents) {
        await exam.update({status: "completed"});
    }

    
    return resulte
}

export const markAbcentStudent = async(examId , studentId , userId)=>{
    return await savResulte({ examId, studentId, absent: true, score: null }, userId)
}


export const GetResultAuditTrail = async (examId, studentId) => {
    return await ExamResultAuditModel.findAll({
        where: { examId, studentId },
        order: [["createdAt", "DESC"]]
    })
}
