import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";



export const FollowUpReminderModel = sequelize.define('FollowUpReminder', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'snoozed'),
        allowNull: false,
        defaultValue: 'active'
    },
    snoozedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true
})
