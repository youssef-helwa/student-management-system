import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";


export const UserModel = sequelize.define('user' , {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true
    },
    fullName : {
        type : DataTypes.STRING,
        allowNull:false
    },
    email : {
        type : DataTypes.STRING,
        allowNull:false,
        unique: true,
        validate: {
        isEmail: true
    }
    },
    password : {
        type :DataTypes.STRING,
        allowNull:false
    },
    role : {
        type: DataTypes.ENUM('Administrator', 'Manager', 'Staff'),
        allowNull :false,
        defaultValue:"Staff"
    },
    status : {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull :false,
        defaultValue:"active"
    },
    avatarInitials:{
        type: DataTypes.STRING
    },
    lastLogin:{ 
        type: DataTypes.DATE,
        allowNull: true,
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "branches",
            key: "id"
        }
}
},{
    timestamps: true
})