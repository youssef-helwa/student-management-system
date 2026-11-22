import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";

export const AttendanceDayModel = sequelize.define(
    "AttendanceDay",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        branchId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        dayType: {
            type: DataTypes.ENUM("regular", "exam"),
            allowNull: false,
            defaultValue: "regular"
        }
    },
    {
        timestamps: true,

        indexes: [
            {
                unique: true,
                fields: ["branchId", "date"]
            }
        ]
    }
);