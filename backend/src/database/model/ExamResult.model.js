import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { StudentModel } from "./Students.model.js";
import { ExamModel } from "./Exam.Model.js";


export const ExamResultModel = sequelize.define('ExamResult' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey: true
    },
    score : {
        type : DataTypes.DECIMAL(5,2),
        allowNull:false
    },
    absent : {
        type : DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    examId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{
    timestamps: true
})