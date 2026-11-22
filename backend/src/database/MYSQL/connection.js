import { Sequelize } from "sequelize";
import { env } from "../../../config/env.services.js";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dbPath = path.join(__dirname, "../../../../../data/data.sqlite");

// connecting on DB
export const sequelize = new Sequelize(
  env.DB_name,
  env.DB_user,
  env.DB_pass,
  {
    host : env.DB_host,
    port : Number(env.DB_Port),
    dialect : env.DB_dialect
});

// Testing DB
export const DBconnection = async() =>{
    try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
}

// this is for sync 
export const DBsync = async() =>{
    try {
      const {UserModel} = await import('../model/user.model.js')
      const {BranchModel} = await import('../model/Branch.model.js')
      const {LogModel} = await import('../model/ActivityLog.model.js')
      const {AttRecordModel} = await import('../model/AttendanceRecored.model.js')
      const {CallRecordModel} = await import('../model/CallHistory.model.js')
      const {ExamModel} = await import('../model/Exam.Model.js')
      const {ExamResultModel} = await import('../model/ExamResult.model.js')
      const {GradesModel} = await import('../model/Grads.model.js')
      const {NotificationModel} = await import('../model/Notification.model.js')
      const {StudentModel} = await import('../model/Students.model.js')
      const {ClassModel} = await import('../model/class.model.js')
      const {PaymentModel} = await import('../model/payment.model.js')
      const {PaymentHistoryModel} = await import('../model/paymentHistory.model.js')
      const {AttendanceDayModel} = await import('../model/AttendanceDay.model.js')
      await import('../model/associations/associations.js')
      await sequelize.sync()
    } catch (error) {
        console.log("Error in Sync" , error)
    }
}