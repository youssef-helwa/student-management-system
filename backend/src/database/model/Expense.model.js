import { DataTypes } from "sequelize";
import { sequelize } from "../MYSQL/connection.js";






export const ExpenseModel = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM(
            "Office Supplies", "Electricity", "Water", "Internet", "Maintenance",
            "Equipment", "Transportation", "Marketing", "Teacher Salary",
            "Cleaning", "Rent", "Other"
        ),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM("Cash", "Instapay", "Other"),
        allowNull: false
    },
    receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending"
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
})
