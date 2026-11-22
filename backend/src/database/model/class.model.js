import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";
import { GradesModel } from "./Grads.model.js";
import { BranchModel } from "./Branch.model.js";


export const ClassModel = sequelize.define('Class' , {
    id : {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name : {
        type : DataTypes.STRING,
        allowNull:false
    },
    teacher : {
        type: DataTypes.STRING
    },
    branchId:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{model:BranchModel , key : "id"}
    },
    gradeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{
    timestamps: true
})