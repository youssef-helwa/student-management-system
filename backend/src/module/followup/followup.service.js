import { Op } from "sequelize"
import { FollowUpReminderModel } from "../../database/model/FollowUpReminder.model.js"
import { StudentModel } from "../../database/model/Students.model.js"
import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"


function today() {
    return new Date().toISOString().slice(0, 10)
}


// export const GetReminder = async(query)=>{
//     let {branchId , status} = query || {}
//     let where ={}
//     if(branchId) where.branchId = branchId
//     if(status) where.status = status
//     let reminder = await FollowUpReminderModel.findAll({where,
//         include :[{model:StudentModel , as : "student"}],
//         order:[["createdAt" , "DESC"]]
//     })
// }

export const AllFollowUps = async (query) =>{
    let {studentId , branchId , status , DueOnly} = query ||{}

    let where = {}
    if(branchId) where.branchId = branchId
    if(studentId) where.studentId = studentId
    if(DueOnly) {
        where[Op.or] = [
            {status : "active"},
            {status : "snoozed"  ,snoozedUntil : {[Op.lte] :today() }}
        ]
    }else if(status){
        where.status = status
    }
    let followup = await FollowUpReminderModel.findAll({
        where ,
        include :[{model : StudentModel , as : "student"}],
        order : [["createdAt" , "DESC"]]
    })
    
    return followup
}


export const getFollowUpCounts = async ({branchId} ={})=>{
    let where = {}
    if(branchId) where.branchId = branchId
    let active = await FollowUpReminderModel.count({
        where : {...where , status : "active"}
    })

    let snoozedAll = await FollowUpReminderModel.findAll({
        where: {...where , status :"snoozed"},
        attributes :["snoozedUntil"]
    })

    let completed = await FollowUpReminderModel.count({
        where : {...where , status :"completed"}
    })

    let dueSnoozed = snoozedAll.filter((f) => f.snoozedUntil && f.snoozedUntil <= today()).length

    return {
        due : active + dueSnoozed,
        active,
        completed,
        snoozed : snoozedAll.length
    }
}


export const GetFollowById = async(id) =>{
    let followup = await FollowUpReminderModel.findByPk(id,{
        include : [{model :StudentModel , as : "student"}]
    })
    if(!followup){
    return BadRequestExeption({message : "not Found"})
}
    return followup
}


export const CreateFollowUp = async(data , userId) =>{
    let {note , studentId , branchId , createdBy} = data || {}
    if(!note || !studentId || !branchId){
        return BadRequestExeption({message : "Note , studentId and branchId are Required"})
    }
    let followUp = await FollowUpReminderModel.create({
        note,
        studentId,
        branchId,
        status :"active",
        snoozedUntil : null ,
        createdBy : userId,
        completedBy :null})

        return followUp
}

export const UpdateFollowUp = async(data , id)=>{
    let{note} = data
    let followup = await FollowUpReminderModel.findByPk(id)
    if(!followup){
        return BadRequestExeption({message :"No reminder Found"})
    }

    if(note !== undefined) followup.note = note
    await followup.update()
    followup.save()
    return followup
}


export const completedFollowUp  = async(data , id) =>{
    let {status , snoozedUntil, completedBy} = data
    let followUp = await FollowUpReminderModel.findByPk(id)
    if (!followUp) {
        return BadRequestExeption({ message: "Follow-Up Reminder Not Found" })
    }
    followUp.status = "completed"
    followUp.snoozedUntil = null
    followUp.completedBy = completedBy
    await followUp.save()
    return followUp
}



export const snoozeFollowUp = async (data , id) => {
    let {snoozedUntil} = data
    if (!snoozedUntil) {
        return BadRequestExeption({ message: "snoozed Until is required" })
    }
    let followUp = await FollowUpReminderModel.findByPk(id)
    if (!followUp) {
        return BadRequestExeption({ message: "Follow-Up Reminder Not Found" })
    }
    followUp.status = "snoozed"
    followUp.snoozedUntil = snoozedUntil
    await followUp.save()
    return followUp
}

export const reActiveFollowUp = async (id) => {
    let followUp = await FollowUpReminderModel.findByPk(id)
    if (!followUp) {
        return BadRequestExeption({ message: "Follow-Up Reminder Not Found" })
    }
    followUp.status = "active"
    followUp.snoozedUntil = null
    await followUp.save()
    return followUp
}

export const deleteFollowUp = async (id) => {
    let followUp = await FollowUpReminderModel.findByPk(id)
    if (!followUp) {
        return BadRequestExeption({ message: "Follow-Up Reminder Not Found" })
    }
    await followUp.destroy()
    return { id }
}