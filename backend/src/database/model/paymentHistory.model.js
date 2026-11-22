import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { PaymentModel } from "./payment.model.js";


export const PaymentHistoryModel = sequelize.define('Payment_History' , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    date : {
        type : DataTypes.DATEONLY,
        allowNull:false
    },
    amount : {
        type : DataTypes.DECIMAL(10 ,2),
        allowNull:false
    },
    method: {
        type : DataTypes.ENUM(
        "cash",
        "visa",
        "bank_transfer",
        "wallet"
    ),
    },
    note : {
        type : DataTypes.TEXT,
    },
    paymentId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps: true
})