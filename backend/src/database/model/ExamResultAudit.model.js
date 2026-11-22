import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";





export const  ExamResultAuditModel = sequelize.define('ExamResultAudit' ,{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    examId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    previousScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    newScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    absent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    changedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
})
