import express from "express"
import cors from "cors";
import { env } from "../config/env.services.js"
import { DBconnection, DBsync } from "./database/MYSQL/connection.js"
import { GlobalError } from "./common/response/error.response.js"

import AuthRouter from "./module/auth/auth.controller.js"
import UserRouter from "./module/users/user.controller.js"
import BranchRouter from "./module/branch/branch.controller.js"
import ActivityLogRouter from './module/activityLogs/activityLogs.controller.js'
import StudentRouter from './module/students/student.controller.js'
import ClassRouter from './module/classes/class.controller.js'
import AttRouter from './module/attendance/attendance.controller.js'
import CallRouter from './module/callHistory/callHistory.controller.js'
import GradeRouter from './module/grades/grades.controller.js'
import ExamRouter from './module/exam/exam.controller.js'
import ExpensesRouter from './module/expenses/expenses.controller.js'
import SessionRouter from './module/session/session.controller.js'
import PaymentRoutre from './module/payment/payment.controller.js'
import ReportRouter from './module/reports/report.controller.js'
import FollowUpRouter from './module/followup/followup.controller.js'
import NotificationRouter from './module/Notification/Notification.controller.js'


export const bootstrap = async () =>{

    const app = express()
    app.use(express.json())

    app.use(cors({
    origin: (origin, callback) => {
        // Electron production requests may have no Origin
        if (!origin || origin === "http://localhost:5173") {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    }));


    await DBconnection()
    await DBsync()


    app.use('/auth' ,AuthRouter)
    app.use('/user' ,UserRouter)
    app.use('/branch' ,BranchRouter)
    app.use('/log' , ActivityLogRouter)
    app.use('/student' , StudentRouter)
    app.use('/class' ,ClassRouter)
    app.use('/att' ,AttRouter)
    app.use('/call' , CallRouter)
    app.use('/grade' , GradeRouter)
    app.use('/expenses' , ExpensesRouter)
    app.use('/session' , SessionRouter)
    app.use('/payment' , PaymentRoutre)
    app.use('/exam' , ExamRouter)
    app.use('/report' , ReportRouter)
    app.use('/notification' , NotificationRouter)
    app.use('/followUp', FollowUpRouter)


    app.get('/check' , (req , res) =>{
        res.json({
            message : "Backend is running"
        })
    })

    app.use('*dummy' , (req ,res) =>{
        res.status(400).json({
            message : "URL is wrong"
        })
    })

    app.use(GlobalError)
    app.listen(3000, '127.0.0.1' , ()=>{
        console.log("server is running👍")
    })
}