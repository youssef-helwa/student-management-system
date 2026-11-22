import { CallRecordModel } from "../../database/model/CallHistory.model.js"
import { StudentModel } from "../../database/model/Students.model.js"





export const Calls = async()=>{
    const results= ["answered", "no_answer", "line_busy", "switched_off", "wrong_number", "invalid_number", "other"]
    const reasons= ["Sick", "Family emergency", "Traveling", "Personal reason", "Other"]
    return {results ,reasons}
}


export const GetCallOfStudent = async(StudentId) =>{
    let StudetCall = await CallRecordModel.findAll({
        where :{id:StudentId},
        include: [{model : StudentModel ,as: "student" ,attributes: { exclude: ["password"] }}],
        order: [["date", "DESC"], ["time", "DESC"]]
    })
    return StudetCall
}


export const LogCallResult = async (data, actor) => {
    const student = await StudentModel.findByPk(data.studentId)
    if (!student) return NotFoundExeption({ message: "Student not found" })

    return await CallRecordModel.create({ ...data, userId: actor })
}