import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";


export const GradesModel = sequelize.define('Grade' , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name : {
        type : DataTypes.STRING,
        allowNull:false
    },
    order : {
        type :DataTypes.INTEGER,
        allowNull:false
    },
    sessionFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    timestamps: true
})