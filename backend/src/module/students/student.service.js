import { Op, where } from "sequelize"
import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { StudentModel } from "../../database/model/Students.model.js"
import { PaymentModel } from "../../database/model/payment.model.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import QRCode from "qrcode";
import { BranchModel } from "../../database/model/Branch.model.js"
import { GradesModel } from "../../database/model/Grads.model.js"
import { ClassModel } from "../../database/model/class.model.js"
import { NotificationModel } from "../../database/model/Notification.model.js"



const includeRefs = [
    { model: BranchModel, as: "branch" },
    { model: GradesModel, as: "Grade" },
    { model: ClassModel, as: "class" }
]


export const GetAllStudent = async (query) =>{
    let {branchId , gradeId , classId , search} = query
    const where = {};
    if (branchId) {
        where.branchId = branchId;
    }
    if (gradeId && gradeId !== "all") {
        where.gradeId = gradeId;
    }
    if(classId && classId !== "all") where.classId = classId

    if(search?.trim()){
        where[Op.or] = {
            fullName : {
                [Op.like] : `%${search.trim()}%`
            },
            studentCode : {
                [Op.like] : `%${search.trim()}%`
            }
        }
    }

    let Students = await StudentModel.findAll({where , include: includeRefs }) 
    return Students
}

export const GetStudent = async(query)=>{
    let {name , studentCode} = query || {}
    const where = {}
    if (!name && !studentCode) {
        return BadRequestExeption({
            message: "Please provide student name or student code."
        });
    }
    if(name){
        where.fullName ={
            [Op.like] : `%${name}%`
        }
    }

    if(studentCode){
        where.studentCode = studentCode
    }
    console.log(studentCode)

    let student = await StudentModel.findAll({where , include: includeRefs })
    console.log("🔥 STUDENTS FOUND:", student.length);

    if(student.length === 0) return NotFoundExeption({message :"Student Not Found"})

    return student
}


export const CreateStudent = async(data , staff)=>{
    let {fullName,
        FatherName,
        studentPhone,
        FatherPhone,
        address,
        qrCode,
        studentCode,
        feeType,
        classId,
        branchId,
        gradeId,
        totalFee,
        paidAmount,
        remainingBalance } = data

        let existFatherPhone = await StudentModel.findOne({where : {FatherPhone}})
        if(existFatherPhone){
            return ConflictExeption({message :"parent Phone is exist"})
        }

        feeType = feeType || "full"

        //create uniqu code
        let exists = true;

        while (exists) {
            studentCode = Math.floor(1000 + Math.random() * 9000).toString();

            exists = await StudentModel.findOne({where: { studentCode }});
        }

        qrCode = await QRCode.toDataURL(studentCode);

        let actualFee = Number(totalFee) || 0
        if(feeType === "half"){
            actualFee = actualFee /2
        }

        if(feeType === "exempted"){
            actualFee = 0
        }
        let student = await StudentModel.create({
            fullName,
            FatherName,
            studentPhone,
            FatherPhone,
            address,
            qrCode,
            studentCode ,
            feeType,
            classId,
            branchId,
            gradeId })

        await PaymentModel.create({studentId:student.id , totalFee: actualFee , paidAmount:actualFee ,remainingBalance:0 , status: feeType === "exempted" ? "exempted" : "paid" })
        await logActivity({action:"student_added" , userId:staff , branchId , detail:`student ${fullName} added`})
        await NotificationModel.create({
        type: "new_student",
        title: "New Student Registered",
        message: `${student.fullName} was added to the system.`,
        branchId,
        studentId: student.id,
        severity: "info"
    })
        return student
}


export const UpdateStudent = async(data , studentId , userId) =>{
    let student = await StudentModel.findByPk(studentId)
    if(!student){
        return BadRequestExeption({message :"No Student Found"})
    }
    await student.update(data)
    await logActivity({action : "Student_Update" , userId , branchId:student.branchId , detail:`Student ${student.fullName} updated`})
    student.save()
    return student
}

export const DeleteStudent = async(data , StudenId ,userId) =>{

    let student = await StudentModel.findByPk(StudenId)

    if(!student) {
        return BadRequestExeption({message :" No Student Found"})
    }
    await student.destroy(data)
    await logActivity({action:"Delete_Student" , userId , branchId:student.branchId ,detail:`Student ${student.fullName} Deleted`})
    student.save()
    return student

}


export const GetStudentId  = async (studentId) => {
    const student = await StudentModel.findByPk(studentId, {
        include: includeRefs
    });

    if (!student) {
        return NotFoundExeption({
            message: "Student Not Found"
        });
    }

    return student;
};