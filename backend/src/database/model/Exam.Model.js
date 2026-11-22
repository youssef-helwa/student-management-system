import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { BranchModel } from "./Branch.model.js";
import { GradesModel } from "./Grads.model.js";


export const ExamModel = sequelize.define('exam' , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name : {
        type : DataTypes.STRING,
        allowNull:false
    },
    subject : {
        type : DataTypes.STRING
    },
    date : {
        type :DataTypes.DATEONLY,
        allowNull:false
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'completed'),
        allowNull: false,
        defaultValue: 'upcoming',
    },
    totalMarks :{
        type : DataTypes.INTEGER
    },
    gradeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    branchId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{
    timestamps: true
})