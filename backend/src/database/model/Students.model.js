import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { BranchModel } from "./Branch.model.js";
import { GradesModel } from "./Grads.model.js";
import { ClassModel } from "./class.model.js";


export const StudentModel = sequelize.define('student' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    studentCode :{
        type :DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    fullName : {
        type : DataTypes.STRING,
        allowNull:false
    },
    FatherName : {
        type : DataTypes.STRING,
        allowNull:false
    },
    studentPhone : {
        type : DataTypes.STRING,
        allowNull:false
    }, 
    FatherPhone : {
        type : DataTypes.STRING,
        allowNull:false
    },
    address : {
        type : DataTypes.STRING
    },
    qrCode : {
        type :DataTypes.STRING,
        allowNull:true,
        unique:true
    },
    feeType : {
        type: DataTypes.ENUM("full" , "half" , 'exempted'),
        allowNull:false,
        defaultValue:"full"
    },
    phoneNeedsUpdate : {
        type : DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    status:{
        type: DataTypes.ENUM("active" , "inactive"),
        allowNull:false,
        defaultValue:"active"
    },
    lastLogin:{ 
        type: DataTypes.DATE,
        allowNull: true,
    },
    classId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    branchId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    gradeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps: true
})