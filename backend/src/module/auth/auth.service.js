import { GenerateToken } from "../../common/middleware/auth/auth.js"
import { CompareHash, GenerateHash } from "../../common/middleware/security/encryption.js"
import { BadRequestExeption, ConflictExeption, ForbiddenExeption, NotFoundExeption, UnAthorizeExption } from "../../common/response/error.response.js"
import { logActivity } from "../../common/utils/LogActivity.js"
import { UserModel } from "../../database/model/user.model.js"




export const GetAdmin = async () =>{
    const admin = await UserModel.findOne({
        where: {
            role: "Administrator"
        }
    });

    return {
        setupRequired: !admin
    };
}



export const SetAdmin = async(data) =>{
    const {fullName,email,password,confirmPassword} = data || {};

    if (!fullName || !email || !password || !confirmPassword) {
        return BadRequestExeption({message: "Full name, email, password and confirm password are required"});
    }


    const existAdmin = await UserModel.findOne({where: {role: "Administrator"}});

    if (existAdmin) {
        return ConflictExeption({message: "Administrator already exists"});
    }

    
    const existEmail = await UserModel.findOne({where: {email}});

    if (existEmail) return ConflictExeption({message: "Email already exists"});

    if (password !== confirmPassword) return BadRequestExeption({message: "Password and confirm password do not match"});

    const hashPass = await GenerateHash(password);

    const admin = await UserModel.create({
        fullName,
        email,
        password: hashPass,
        role: "Administrator",
        branchId: null,
        status: "active"
    });

    if (!admin) {
        return BadRequestExeption({
            message: "Cannot create Administrator"
        });
    }
    console.log(admin , "from admin")
    const accessToken =await GenerateToken({userId: admin.id } , admin.role)

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    return {
        success: true,
        admin: adminResponse,
        accessToken
    };
};

export const login = async(data) =>{
    let {email , password} = data
    let user = await UserModel.findOne({where :{email}})
    if(!user){
        return NotFoundExeption({message : "Wrong Email"})
    }
    if(user.status === "inactive"){
        return ForbiddenExeption({message : "Your account has been deactivated"})
    }
    let validpass = await CompareHash(password , user.password)
    if(!validpass){
        return UnAthorizeExption({message: "Wrong Password"})
    }
    user.lastLogin = new Date()
    await user.save()
    
    await logActivity({
        action : "login",
        userId: user.id,
        branchId : user.branchId,
        detail : `${user.fullName} loggin in`
    })
    let accessToken = await GenerateToken({userId : user.id} , user.role)
    let userResponse = user.toJSON()
    delete userResponse.password

    return {user : userResponse ,accessToken}
}


export const ChangePass = async(data , userId) =>{
    let {password ,ConfirmPassword , newPassword } = data ||{}
    let user = await UserModel.findByPk(userId)
    if(!user){
        return BadRequestExeption({message:"User not found."})
    }

    if(password || newPassword  || ConfirmPassword){
        if(!password){
            return BadRequestExeption({message: "please enter your old password"})
        }
        if(!newPassword){
            return BadRequestExeption({message: "please enter your new password"})
        }
        if(!ConfirmPassword){
            return BadRequestExeption({message: "please enter your confirm password"})
        }
        const isMatch = await CompareHash(password , user.password)
        if(!isMatch){
            return BadRequestExeption({message: "Password is incorrect"})
        }
        if(newPassword !== ConfirmPassword){
            return BadRequestExeption({message :"please make newpassword equal confirmpassword"})
        }
        user.password = await GenerateHash(newPassword)
        await user.save();
    }

    let userResponse = user.toJSON()
    delete userResponse.password

    return userResponse
}


export const ResetPass = async (data , userId) =>{
    let {newPassword , confirmPassword} = data || data
    const user = await UserModel.findByPk(userId)

    if(!user){
        return BadRequestExeption({message :"User Not Found"})
    }
    if (!newPassword) {
        return BadRequestExeption({
            message: "Please enter the new password.",
        });
    }

    if (!confirmPassword) {
        return BadRequestExeption({
            message: "Please confirm the password.",
        });
    }
    if (newPassword !== confirmPassword) {
        return BadRequestExeption({
            message: "Passwords do not match.",
        });
    }
    
    user.password = await GenerateHash(newPassword);
    await user.save();

    let userResponse = user.toJSON()
    delete userResponse.password

    return userResponse
}


export const Logout = async (userId) =>{
    let user = await UserModel.findByPk(userId)
    if(!user){
        return BadRequestExeption({message : "No user Found"})
    }
    await logActivity({
            action: "logout",
            userId : user.id,
            branchId : user.branchId,
            detail: `${user.fullName} logged out`
        })
        return {success : true}
}
