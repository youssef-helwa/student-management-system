import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";



export const SessionModel = sequelize.define("session" , {
    id :{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    status :{
        type :DataTypes.ENUM("open" , "closed"),
        allowNull:false
    },
    startedAt:{
        type:DataTypes.DATE,
        allowNull:false
    },
    closedAt :{
        type: DataTypes.DATE,
        allowNull:true
    },
    startedBy:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    closedBy:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    classId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gradeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
})