import { CompareHash, GenerateHash } from "../../common/middleware/security/encryption.js"
import { BadRequestExeption, ConflictExeption, NotFoundExeption } from "../../common/response/error.response.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { UserModel } from "../../database/model/user.model.js"
import { Op } from "sequelize"


export const GetUser = async() =>{
    let users = await UserModel.findAll({attributes: {exclude: ["password"]}})
    if(users.length == 0){
        return {message: "thier is no users found "}
    }
    return users
}

export const GetUserIdAdmin = async(userId) =>{
    let user = await UserModel.findByPk(userId , {attributes: {exclude: ["password"]}})
    if(!user){
        return BadRequestExeption({message : "User Not Found"})
    }
    return user
}

export const AddUser = async(data)=>{
    let {fullName, email, password, ConfirmPassword, role, branchId, status, avatarInitials} = data || {}
    
    if(!fullName || !email || !password || !role ){
        return BadRequestExeption({message : "please Set your name , email ,password, and branch all required"})
    }


    if (role !== "Administrator" && !branchId) {
        return BadRequestExeption({
            message: "Branch is required for Manager and Staff"
        });
    }

    // Administrator must NOT have a branch
    if (role === "Administrator") {
        branchId = null;
    }

    let existEmail = await UserModel.findOne({where : {email}})
    if(existEmail){
        return ConflictExeption({message: " Email already Exist"})
    }

    if(password !== ConfirmPassword){
        return BadRequestExeption({message : "Password and Confirm Password do not match"})
    }

    const hashPass = await GenerateHash(password)

    let User = await UserModel.create({fullName, email, password : hashPass, role, branchId, status})

    if(!User){
        return BadRequestExeption({message :" cannot add user"})
    }

    await logActivity({
        action: "create-user",
        userId: User.id,
        branchId: User.branchId,
        detail: `User ${User.fullName} was created`
    });
    
    let userResponse = User.toJSON()
    delete userResponse.password

    return userResponse
}

export const GetUserId = async(userId) =>{
    let user = await UserModel.findByPk(userId ,{attributes: {exclude: ["password"]}})
    if(!user){
        return NotFoundExeption({message :"their is no user"})
    }
    return user
}


export const UpdateUser = async(data , userId ) =>{
    let {fullName , password , newpassword , email } = data || {}

    let existEmail = await UserModel.findOne({where :{email}})
    if(existEmail){
        return ConflictExeption({message:"email already Exist"})
    }
    let user = await UserModel.findByPk(userId)
    if (!user) return NotFoundExeption({message: "User not found"})

    let newData = {}
    if(password || newpassword){
        if(!password){
            return BadRequestExeption({message : "please entre your old password"})
        }
        if(!newpassword){
            return BadRequestExeption({message : "please entre your newpassword"})
        }
        if(password == newpassword){
            return BadRequestExeption({message : "New password must be different"})
        }
        let isMatch = await CompareHash(password , user.password)
        if(!isMatch){
            return BadRequestExeption({message: "Your password incorrect"})
        }
        newData.password = await GenerateHash(newpassword)
    }

    if(fullName) newData.fullName = fullName
    if(email) newData.email = email

    await UserModel.update(
    newData,
    {
        where: { id: userId },
        
    })

    let updatedUser = await UserModel.findByPk(userId, {
        attributes: {
            exclude: ["password"]
        }
    })

    return updatedUser
}



export const DeleteUser = async(userId) =>{
    let user = await UserModel.destroy({where : {id :userId}})
    if(user === 0){
        return BadRequestExeption({message: "No User Found"})
    }
    return {success : true}
}


export const StatusOfUser = async (data, userId) => {
    if(!data){
        return BadRequestExeption({message: "PLesae Enter the data"})
    }
    const { status } = data;

    if (!["active", "inactive"].includes(status)) {
        return BadRequestExeption({
            message: "Invalid status",
        });
    }

    const user = await UserModel.findByPk(userId);

    if (!user) {
        return BadRequestExeption({
            message: "No User Found",
        });
    }

    if (user.status === status) {
        return BadRequestExeption({
            message: `status already ${status}`,
        });
    }

    user.status = status;

    await user.save();

    let userResponse = user.toJSON()
    delete userResponse.password

    return userResponse
};


export const Search = async(userName) =>{
    let users = await UserModel.findAll({
        where:{
            fullName:{ 
                [Op.like]:`%${userName}%`
            }
        } ,
        attributes: {
            exclude: ["password"]
        }
    })

    if(users.length === 0){
        return NotFoundExeption({message : "User not found"})
    }
    return users;
} 



export const GetPermissionMatrix = async () => {
    return {
        roles: ["Administrator", "Manager", "Staff"],
        matrix: {
            users: { Administrator: ["read", "create", "update", "delete"], Manager: ["read", "create", "update", "delete"], Staff: ["read"] },
            branches: { Administrator: ["read", "create", "update", "delete"], Manager: ["read"], Staff: ["read"] },
            students: { Administrator: ["read", "create", "update", "delete"], Manager: ["read", "create", "update", "delete"], Staff: ["read", "create", "update"] },
            attendance: { Administrator: ["read", "create"], Manager: ["read", "create"], Staff: ["read", "create"] },
            exams: { Administrator: ["read", "create", "update", "delete"], Manager: ["read", "create", "update", "delete"], Staff: ["read"] },
            payments: { Administrator: ["read", "create", "update"], Manager: ["read", "create", "update"], Staff: ["read"] },
            reports: { Administrator: ["read"], Manager: ["read"], Staff: [] }
        }
    }
}