import nodemailer from "nodemailer";
import { env } from "../../../../config/env.services.js";


export const transport = nodemailer.createTransport({
    service:"gmail",
    auth : {
        user : env.email_account_app,
        pass: env.email_pass_app
    }
})



export const sendEmail = async({to, subject , html}) =>{
    const info = await transport.sendMail({
        from:`abdallah saleh ${env.email_account_app}`,
        to,
        subject,
        html
    })
    return info
}