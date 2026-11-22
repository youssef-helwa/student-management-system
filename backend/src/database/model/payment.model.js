import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { StudentModel } from "./Students.model.js";


export const PaymentModel = sequelize.define('payment' , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    totalFee : {
        type : DataTypes.DECIMAL(10 ,2),
        allowNull:false,
        defaultValue : 0
    },
    paidAmount : {
        type : DataTypes.DECIMAL(10 ,2),
        allowNull:false,
        defaultValue : 0
    },
    remainingBalance : {
        type : DataTypes.DECIMAL(10 ,2),
        allowNull:false,
        defaultValue : 0
    },
    status : {
        type : DataTypes.ENUM('paid', 'unpaid', 'exempted'),
        allowNull:false,
        defaultValue : "unpaid"
    },
    studentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps: true
})