import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { StudentModel } from "./Students.model.js";
import { UserModel } from "./user.model.js";


export const CallRecordModel = sequelize.define('CallRecord' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    date : {
        type : DataTypes.DATEONLY,
        allowNull:false,
    },
    time : {
        type :DataTypes.TIME,
        allowNull:false
    },
    userId : {
        type :DataTypes.INTEGER,
        allowNull : false
    },
    result: {
    type: DataTypes.ENUM(
        "answered",
        "no_answer",
        "line_busy",
        "switched_off",
        "wrong_number",
        "invalid_number",
        "other"
    ),
    allowNull: false,
    },
    reason : {
        type : DataTypes.ENUM(
        "Sick",
        "Family emergency",
        "Traveling",
        "Personal reason",
        "Other"),
        allowNull : true
    }, 
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps: true
})