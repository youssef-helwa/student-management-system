import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { BranchModel } from "./Branch.model.js";
import { StudentModel } from "./Students.model.js";



export const NotificationModel = sequelize.define("Notification" , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    type : {
        type : DataTypes.STRING,
        allowNull:false
    },
    title:{
        type : DataTypes.STRING,
        allowNull:false
    },
    message : {
        type : DataTypes.TEXT,
        allowNull:false
    },
    read : {
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue : false
    },
    severity : {
        type : DataTypes.ENUM('info', 'warning', 'critical'),
        allowNull :false,
        defaultValue : "info"
    },
    branchId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:true
    }

},{
    timestamps : true
})