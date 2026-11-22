import { BadRequestExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { GradesModel } from "../../database/model/Grads.model.js"
import { PaymentModel } from "../../database/model/payment.model.js"
import { PaymentHistoryModel } from "../../database/model/paymentHistory.model.js"
import { StudentModel } from "../../database/model/Students.model.js"


const recalcStatus = (payment) => {
    if (payment.status === "exempted") return "exempted"
    if (Number(payment.paidAmount) <= 0) return "unpaid"
    if (Number(payment.paidAmount) >= Number(payment.totalFee) && Number(payment.totalFee) > 0) return "paid"
    return "partial"
}

export const AllPayment = async()=>{
    let payments = await PaymentModel.findAll({
        include:[{model :StudentModel , as : "student"},
            {model:PaymentHistoryModel , as : 'PaymentHistory'}
        ]
    })
    return payments
}


export const PaymentByStydent = async(studentId) =>{
    let payment = await PaymentModel.findOne({
        where : {studentId},
        include:[{model:PaymentHistoryModel , as : "PaymentHistory"}]
    })
    return payment
}


export const TotalFee = async(data) =>{
    let {studentId , totalFee} = data
    let payment = await PaymentModel.findOne({where :{studentId}})
    if(!payment) {
        return NotFoundExeption({message:"payment record not found for this student"})
    }
    payment.totalFee = totalFee
    payment.remainingBalance = Math.max(0 , Number(totalFee) - Number(payment.paidAmount))
    payment.status = recalcStatus(payment)
    await payment.save()
    return payment
}


// dashbord
export const GetPayment = async (query) => {
    let { branchId, gradeId, date } = query;

    const today = date || new Date().toISOString().slice(0, 10);

    const studentWhere = {};

    if (branchId) studentWhere.branchId = branchId;
    if (gradeId) studentWhere.gradeId = gradeId;

    const payments = await PaymentModel.findAll({
        include: [
            {
                model: StudentModel,
                as: "student",
                where: studentWhere,
                required: true,
                include: [
                    {
                        model: GradesModel,
                        as: "Grade"
                    }
                ]
            },
            {
                model: PaymentHistoryModel,
                as: "PaymentHistory",
                where: {
                    date: today
                },
                required: false
            }
        ],
        order: [["createdAt", "DESC"]]
    });

    let expectedIncome = 0;
    let amountCollected = 0;
    let remainingUnpaidAmount = 0;

    const paymentData = [];

    payments.forEach((pay) => {

        const history = pay.PaymentHistory || [];

        const todayPaid = history.reduce(
            (sum, record) => sum + Number(record.amount || 0),
            0
        );

        if (todayPaid <= 0) return;

        expectedIncome += todayPaid;
        amountCollected += todayPaid;

        paymentData.push({
            paymentId: pay.id,
            studentId: pay.student.id,
            student: pay.student.fullName,
            feeType: pay.student.feeType,
            totalFee: Number(pay.totalFee),
            paidAmount: todayPaid,
            remainingBalance: Math.max(
                0,
                Number(pay.totalFee) - Number(pay.paidAmount)
            ),
            status: pay.status
        });
    });

    return {
        date: today,
        summary: {
            expectedIncome,
            amountCollected,
            remainingUnpaidAmount
        },
        paymentData
    };
};
