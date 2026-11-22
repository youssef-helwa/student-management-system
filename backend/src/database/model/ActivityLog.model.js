import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { BranchModel } from "./Branch.model.js";
import { UserModel } from "./user.model.js";


export const LogModel = sequelize.define('log' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    action : {
        type: DataTypes.ENUM(
        "login",
        "logout",
        "attendance_recorded",
        "student_added",
        "student_updated",
        "student_deleted",
        "payment_updated",
        "exam_updated",
        "daily_report_generated",
        "daily_report_sent"
    ),
        allowNull:false
    },
    userId : {
        type : DataTypes.INTEGER,
        allowNull:false,
    },
    detail : {
        type :DataTypes.TEXT
    },
    branchId : {
        type :DataTypes.INTEGER,
        allowNull : false ,
    },
    timestamp : {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue : DataTypes.NOW
}
},{
    timestamps: true
})