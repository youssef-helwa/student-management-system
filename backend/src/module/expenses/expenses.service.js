import { Op } from "sequelize"
import { BadRequestExeption, ForbiddenExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { ExpenseModel } from "../../database/model/Expense.model.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { UserModel } from "../../database/model/user.model.js"



const includeRefs = [
    { model: UserModel, as: "creator", attributes: { exclude: ["password"] } },
    { model: UserModel, as: "reviewer", attributes: { exclude: ["password"] } }
]


export const GetExpenses = async(query , userId , userRole)=>{
    let {branchId ,status , category , from , to} = query || {}
    const where = {}
    if(branchId) where.branchId =branchId
    if(status) where.status = status
    if (category) where.category = category
    if (from || to) {
        where.createdAt = {}
        if (from) where.createdAt[Op.gte] = new Date(from)
        if (to) where.createdAt[Op.lte] = new Date(to)
    }

    if (userRole === "Staff") {
        where.createdBy = userId
    }

    return await ExpenseModel.findAll({ where, include: includeRefs, order: [["createdAt", "DESC"]] })
}



export const GetExpenseId = async (id , userId , userRole) =>{
    let expenses = await ExpenseModel.findByPk(id ,{include : includeRefs})
    console.log(expenses)
    if(!expenses) return NotFoundExeption({message : "Expenses Not Found"})
    if(userRole === "Staff" && expenses.createdBy !== userId){
        return ForbiddenExeption({message :"You Can Only view your own expenses"})
    }
    return expenses
}


export const CreateExpenses = async (data , userId) =>{
    let expenses = await ExpenseModel.create({...data , createdBy :userId , status:"pending"})
    await logActivity({action :"expenses-created" , userId , branchId:expenses.branchId , detail:`Expenses "${expenses.description} (${expenses.amount} EGP) created`})
    return expenses
}




export const UpdateExpenses = async(data ,ExpensesId , userId , userRole)=>{
    let { amount , category ,description , paymentMethod ,branchId , receiptUrl} = data || {}
    let expenses = await ExpenseModel.findByPk(ExpensesId)
    if(!expenses) return NotFoundExeption({message :"No expenses Found"})

    // Staff can only thier own expenses
    if(userRole === "Staff" && expenses.createdBy !== userId){
        return ForbiddenExeption({message : "You are not allowed to edit this expense." })
    }
    if (amount !== undefined) expenses.amount = amount;
    if (category) expenses.category = category;
    if (description) expenses.description = description;
    if (paymentMethod) expenses.paymentMethod = paymentMethod;
    if (branchId) expenses.branchId = branchId;
    if (receiptUrl) expenses.receiptUrl = receiptUrl;
    
    await expenses.save();
    await logActivity({action:"expense_edited" , userId , branchId:expenses.branchId , detail :`Expense #${expenses.id} edited`})
    return expenses;
}

export const deleteExpenses = async(ExpensesId , userId) =>{
    let expenses = await ExpenseModel.findByPk(ExpensesId)
    if(!expenses) {
        return NotFoundExeption({message :"Expenses not found"})
    }
    await logActivity({action:"expense-deleted" , userId , branchId :expenses.branchId , detail: `Expense "${expense.description}" (${expense.amount} EGP) deleted`})
    await expenses.destroy()
    expenses.save()
    return {success :true , expenses}
}

export const ApprovedExpenses = async(expenseId , userId) =>{
    let expense = await ExpenseModel.findByPk(expenseId)
    if(!expense){
        return NotFoundExeption({message :"Not foud Expenses"})
    }
    if(expense.status !== "pending"){
        return BadRequestExeption({message: `Expense is already ${expense.status}`})
    }

    expense.status = "approved"
    expense.reviewedBy = userId
    expense.reviewedAt = new Date()
    await expense.update()
    expense.save()
    await logActivity({action: "Expense_approved", userId, branchId: expense.branchId, detail: `Expense "${expense.description}" (${expense.amount} EGP) approved` })
    return expense
}


export const RejectExpense = async (id, actor) => {
    let expense = await ExpenseModel.findByPk(id)
    if (!expense) return NotFoundExeption({ message: "Expense not found" })
    if (expense.status !== "pending") {
        return BadRequestExeption({ message: `Expense is already ${expense.status}` })
    }

    expense.status = "rejected"
    expense.reviewedBy = actor
    expense.reviewedAt = new Date()
    await expense.save()

    await logActivity({ action: "expense_rejected", userId: actor, branchId: expense.branchId, detail: `Expense "${expense.description}" (${expense.amount} EGP) rejected` })

    return expense
}