import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";


export const BranchModel = sequelize.define('branch' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    name : {
        type : DataTypes.STRING,
        allowNull:false
    },
    code : {
        type : DataTypes.STRING,
        allowNull:false,
        unique: true
    },
    address : {
        type :DataTypes.STRING,
    }
},{
    timestamps: true
})