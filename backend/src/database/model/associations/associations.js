import { LogModel } from "../ActivityLog.model.js";
import { AttRecordModel } from "../AttendanceRecored.model.js";
import { BranchModel } from "../Branch.model.js";
import { CallRecordModel } from "../CallHistory.model.js";
import { ClassModel } from "../class.model.js";
import { ExamModel } from "../Exam.Model.js";
import { ExamResultModel } from "../ExamResult.model.js";
import { ExamResultAuditModel } from "../ExamResultAudit.model.js";
import { ExpenseModel } from "../Expense.model.js";
import { FollowUpReminderModel } from "../FollowUpReminder.model.js";
import { GradesModel } from "../Grads.model.js";
import { NotificationModel } from "../Notification.model.js";
import { PaymentModel } from "../payment.model.js";
import { PaymentHistoryModel } from "../paymentHistory.model.js";
import { SessionModel} from "../session.model.js";
import { StudentModel } from "../Students.model.js";
import { UserModel } from "../user.model.js";




// 1 branch have many users
BranchModel.hasMany(UserModel ,{
    foreignKey: "branchId",
    as : "users"
})

UserModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

///////////////////////////////////////////////////
// // 1 branch have many Students
BranchModel.hasMany(StudentModel ,{
    foreignKey: "branchId",
    as : "Students"
})

StudentModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

// // 1 branch have many Classes
BranchModel.hasMany(ClassModel ,{
    foreignKey: "branchId",
    as : "Classes"
})

ClassModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

// // 1 branch have many Exams

BranchModel.hasMany(ExamModel ,{
    foreignKey: "branchId",
    as : "exam"
})

ExamModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

// // 1 branch have many Attendace Recoreds
BranchModel.hasMany(AttRecordModel ,{
    foreignKey: "branchId",
    as : "AttendaceRecords"
})

AttRecordModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

// // 1 branch have many Notifications
BranchModel.hasMany(NotificationModel ,{
    foreignKey: "branchId",
    as : "Notifications"
})

NotificationModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})


// // 1 branch have many LOGS
BranchModel.hasMany(LogModel ,{
    foreignKey: "branchId",
    as : "Logs"
})

LogModel.belongsTo(BranchModel ,{
    foreignKey : "branchId",
    as : "branch"
})

//////////////////////////////////////////////////////////////////////////////
// Grads

// Grads has many Attendace Recoreds
GradesModel.hasMany(AttRecordModel,{
    foreignKey : "gradeId",
    as:"AttendanceRecordes"
})

AttRecordModel.belongsTo(GradesModel ,{
    foreignKey : "gradeId",
    as : "Grade"
})

// Grads has many Attendace Classes
GradesModel.hasMany(ClassModel,{
    foreignKey : "gradeId",
    as:"Classes"
})

ClassModel.belongsTo(GradesModel ,{
    foreignKey : "gradeId",
    as : "Grade"
})
// Grads has many Exams
GradesModel.hasMany(ExamModel,{
    foreignKey : "gradeId",
    as:"exam"
})

ExamModel.belongsTo(GradesModel ,{
    foreignKey : "gradeId",
    as : "Grade"
})

// Grads has many Students
GradesModel.hasMany(StudentModel,{
    foreignKey : "gradeId",
    as:"Students"
})

StudentModel.belongsTo(GradesModel ,{
    foreignKey : "gradeId",
    as : "Grade"
})

//////////////////////////////////////////////////////////////////////
//Classes

//Classes has many Students
ClassModel.hasMany(StudentModel, {
    foreignKey: "classId",
    as: "students"
});
StudentModel.belongsTo(ClassModel, {
    foreignKey: "classId",
    as: "class"
});

//Classes has many Attendace records
ClassModel.hasMany(AttRecordModel, {
    foreignKey: "classId",
    as: "attendanceRecords"
});
AttRecordModel.belongsTo(ClassModel, {
    foreignKey: "classId",
    as: "class"
});


////////////////////////////////////////////////////////
// Studens

// Studens has many Payments
StudentModel.hasMany(PaymentModel ,{
    foreignKey: "studentId",
    as:"payments"
})

PaymentModel.belongsTo(StudentModel,{
    foreignKey:"studentId",
    as:"student"
})

// Studens has many Attendace Recordes
StudentModel.hasMany(AttRecordModel ,{
    foreignKey: "studentId",
    as:"AttendanceRecords"
})

AttRecordModel.belongsTo(StudentModel,{
    foreignKey:"studentId",
    as:"student"
})
// Studens has many CallRecords
StudentModel.hasMany(CallRecordModel ,{
    foreignKey: "studentId",
    as:"CallHistory"
})

CallRecordModel.belongsTo(StudentModel,{
    foreignKey:"studentId",
    as:"student"
})

// Studens has many Exams Resulte

StudentModel.hasMany(ExamResultModel ,{
    foreignKey: "studentId",
    as:"ExamsResulte"
})

ExamResultModel.belongsTo(StudentModel,{
    foreignKey:"studentId",
    as:"student"
})

// Studens has many Notifications

StudentModel.hasMany(NotificationModel ,{
    foreignKey: "studentId",
    as:"Notification"
})

NotificationModel.belongsTo(StudentModel,{
    foreignKey:"studentId",
    as:"student"
})

//////////////////////////////////////////////
//Payment

// Payment has many Payment History
PaymentModel.hasMany(PaymentHistoryModel ,{
    foreignKey: "paymentId",
    as:"PaymentHistory"
})

PaymentHistoryModel.belongsTo(PaymentModel,{
    foreignKey:"paymentId",
    as:"Payment"
})


///////////////////////////////////////
//Exam

// Exams has many Exmas Resulte
ExamModel.hasMany(ExamResultModel ,{
    foreignKey: "examId",
    as:"ExamResulte"
})

ExamResultModel.belongsTo(ExamModel,{
    foreignKey:"examId",
    as:"exam"
})


////////////////////////////////////////////
// users


// User has many Calls History
UserModel.hasMany(CallRecordModel, {
    foreignKey: "userId",
    as: "calls"
});
CallRecordModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
});

// user has many logs
UserModel.hasMany(LogModel, {
    foreignKey: "userId",
    as: "logs"
});
LogModel.belongsTo(UserModel, {
    foreignKey: "userId",
    as: "user"
});

//////////////////////////////////////////////
// Exam Result Audit

ExamModel.hasMany(ExamResultAuditModel, {
    foreignKey: "examId",
    as: "ResultAudits"
});
ExamResultAuditModel.belongsTo(ExamModel, {
    foreignKey: "examId",
    as: "exam"
});

StudentModel.hasMany(ExamResultAuditModel, {
    foreignKey: "studentId",
    as: "ResultAudits"
});
ExamResultAuditModel.belongsTo(StudentModel, {
    foreignKey: "studentId",
    as: "student"
});

UserModel.hasMany(ExamResultAuditModel, {
    foreignKey: "changedBy",
    as: "resultChanges"
});
ExamResultAuditModel.belongsTo(UserModel, {
    foreignKey: "changedBy",
    as: "changedByUser"
});

//////////////////////////////////////////////
// Follow-up Reminders

StudentModel.hasMany(FollowUpReminderModel, {
    foreignKey: "studentId",
    as: "Reminders"
});
FollowUpReminderModel.belongsTo(StudentModel, {
    foreignKey: "studentId",
    as: "student"
});

BranchModel.hasMany(FollowUpReminderModel, {
    foreignKey: "branchId",
    as: "Reminders"
});
FollowUpReminderModel.belongsTo(BranchModel, {
    foreignKey: "branchId",
    as: "branch"
});

UserModel.hasMany(FollowUpReminderModel, {
    foreignKey: "createdBy",
    as: "createdReminders"
});
FollowUpReminderModel.belongsTo(UserModel, {
    foreignKey: "createdBy",
    as: "creator"
});

//////////////////////////////////////////////
// Expenses

BranchModel.hasMany(ExpenseModel, {
    foreignKey: "branchId",
    as: "expenses"
});
ExpenseModel.belongsTo(BranchModel, {
    foreignKey: "branchId",
    as: "branch"
});

UserModel.hasMany(ExpenseModel, {
    foreignKey: "createdBy",
    as: "createdExpenses"
});
ExpenseModel.belongsTo(UserModel, {
    foreignKey: "createdBy",
    as: "creator"
});

UserModel.hasMany(ExpenseModel, {
    foreignKey: "reviewedBy",
    as: "reviewedExpenses"
});
ExpenseModel.belongsTo(UserModel, {
    foreignKey: "reviewedBy",
    as: "reviewer"
});

//////////////////////////////////////////////
// SessionModel

ClassModel.hasMany(SessionModel, {
    foreignKey: "classId",
    as: "sessions"
});
SessionModel.belongsTo(ClassModel, {
    foreignKey: "classId",
    as: "class"
});

// 1 Branch has many Sessions
BranchModel.hasMany(SessionModel, {
    foreignKey: "branchId",
    as: "sessions"
});
SessionModel.belongsTo(BranchModel, {
    foreignKey: "branchId",
    as: "branch"
});

//1 attendacerecord has 1 session
SessionModel.hasMany(AttRecordModel, {
    foreignKey: "sessionId",
    as: "attendanceRecords"
});
AttRecordModel.belongsTo(SessionModel, {
    foreignKey: "sessionId",
    as: "session"
});