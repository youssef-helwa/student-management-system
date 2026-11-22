import jwt from "jsonwebtoken";
import { env } from "../../../../config/env.services.js";
import { UserModel } from "../../../database/model/user.model.js";
import { BadRequestExeption, ForbiddenExeption, UnAthorizeExption } from "../../response/error.response.js";


export const auth = async (req, res, next) => {
    try {

        // console.log(req.headers, "from req in Auth")

        const authorization  = req.headers.authorization;
        // console.log(authorization , "from authorization ")

        // No token
        if (!authorization) {
            return UnAthorizeExption({
                message: "Authorization token is required"
            });
        }

        const [flag, token] = authorization.split(" ");

        // Invalid authorization format
        if (flag !== "Bearer" || !token) {
            return UnAthorizeExption({
                message: "Invalid authorization format"
            });
        }

        // Decode token first to determine role/signature
        const decodedData = jwt.decode(token);

        if (!decodedData || !decodedData.aud) {
            return UnAthorizeExption({
                message: "Invalid token"
            });
        }

        const role = Array.isArray(decodedData.aud)
            ? decodedData.aud[0]
            : decodedData.aud;

        let signature;

        switch (role) {

            case "Staff":
                signature = env.user_signeture;
                break;

            case "Manager":
                signature = env.manager_signeture;
                break;

            case "Administrator":
                signature = env.admin_signeture;
                break;

            default:
                return UnAthorizeExption({
                    message: "Invalid user role"
                });
        }

        // console.log(token , "from decoded token ")
        // Verify token
        const decoded = jwt.verify(token, signature);
        // console.log(decoded , "from decoded auth ")

        // console.log(decoded.userId , "from decoded auth userID ")
        // Find user
        const user = await UserModel.findByPk(decoded.userId);
        // console.log(user , "from auth user")

        if (!user) {
            return BadRequestExeption({
                message: "User Not Found"
            });
        }

        // Check account status
        if (user.status !== "active") {
            return ForbiddenExeption({
                message: "Your account has been deactivated"
            });
        }

        // Store authenticated user information
        req.user = decoded.userId;
        req.role = role;

        // IMPORTANT:
        // Administrator is allowed to have NULL branchId
        req.BranchId = user.branchId;

        next();

    } catch (error) {

        console.error("AUTH ERROR:", error);

        return UnAthorizeExption({
            message: "Invalid or expired token"
        });
    }
};



export const GenerateToken = async (payrol , role) =>{
    let signeture = ''

    switch (role) {
        case "Staff":
            signeture = env.user_signeture
            break;

        case "Manager":
            signeture = env.manager_signeture
            break;

        case "Administrator":
            signeture = env.admin_signeture
            break;
        default:
            throw new Error("Invalid role");
    }

    let accessToken = jwt.sign(payrol , signeture , {
        expiresIn : "1y",
        audience : [role]
    })
    return accessToken
}