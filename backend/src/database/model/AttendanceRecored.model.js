import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { StudentModel } from "./Students.model.js";
import { GradesModel } from "./Grads.model.js";
import { BranchModel } from "./Branch.model.js";
import { ClassModel } from "./class.model.js";


export const AttRecordModel = sequelize.define('AttRecord' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    date : {
        type : DataTypes.DATEONLY,
        allowNull:false
    },
    status : {
        type : DataTypes.ENUM('present', 'absent', 'excused'),
        allowNull:false
    },
    method : {
        type :DataTypes.ENUM('QR' , "manual"),
        allowNull: false,
        defaultValue: "manual"
    },
    checkInTime : {
        type :DataTypes.TIME
    },
    classId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    branchId:{
        type:DataTypes.INTEGER,
        allowNull:false,

    },
    gradeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    sessionId: {
    type: DataTypes.INTEGER,
    allowNull: true
    },
    dayType: {
    type: DataTypes.ENUM("regular","exam"),
    allowNull: false,
    defaultValue: "regular"
    },
    amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
    }
},{
    timestamps: true
})