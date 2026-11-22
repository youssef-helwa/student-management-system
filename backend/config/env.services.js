import dotenv from "dotenv"

dotenv.config({path: './config/.env'})

const port = process.env.PORT
const DB_url = process.env.DB_URL
const mood = process.env.MOOD
const salt = process.env.SALT
const admin_signeture = process.env.ADMIN_SIGNETURE
const user_signeture = process.env.USER_SIGNETURE
const manager_signeture = process.env.MANAGER_SIGNETURE
const email_account_app = process.env.EMAIL_APP_ACCOUNT
const email_pass_app = process.env.EMAIL_APP_PASSWORD

const DB_name = process.env.DB_NAME
const DB_user = process.env.DB_USER
const DB_pass = process.env.DB_PASSWORD
const DB_host = process.env.DB_HOST
const DB_dialect = process.env.DB_DIALECT
const DB_Port = process.env.DB_PORT

export const env ={
    port,
    DB_url,
    mood,
    salt,
    admin_signeture,
    user_signeture,
    manager_signeture,
    email_account_app,
    email_pass_app,
    DB_name,
    DB_user,
    DB_pass,
    DB_host,
    DB_dialect,
    DB_Port
}