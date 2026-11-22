import Joi from "joi";





export const addUserSchema = Joi.object({
    fullName  : Joi.string().required().min(3).max(255),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    ConfirmPassword: Joi.string().required(),
    role : Joi.string().valid('Administrator', 'Manager', 'Staff').required(),
    branchId : Joi.number().integer().required()
})


export const UpdateUserSchema = Joi.object({
    fullName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    newpassword: Joi.string().min(6),
    role: Joi.string().valid('Administrator', 'Manager', 'Staff'),
    branchId: Joi.number().integer()
})