export const SuccessRespose = ({res ,message = "Done" ,status = 200 , data = undefined }={}) =>{
    return res.status(status).json({message , data})
}