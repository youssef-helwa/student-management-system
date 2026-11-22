import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { Authorize } from "../../common/middleware/authorization/authorization.js";
import { AllGrades, AllGradesID, CreateGrade, CreateGradeFee, DeleteGrade, GradesFee, UpdateGrade, UpdateGradeFee } from "./grades.service.js";


const router = Router()


router.get("/all", auth, async (req, res) => {
    let data = await AllGrades();
    SuccessRespose({res, message: "All Grades", data});
});

// router.get("/getGrades", auth, async (req, res) => {
//     let data = await getGrades();
//     SuccessRespose({res, message: "All Grades", data});
// });


router.post("/add", auth, async (req, res) => {
    let data = await CreateGrade(req.body);
    SuccessRespose({res, message: "Grade Created", data});
});


router.put("/updated/:id", auth, async (req, res) => {
    let data = await UpdateGrade(req.body,req.params.id);
    SuccessRespose({res,message: "Grade Updated",data});
});


router.delete("/delete/:id", auth, async (req, res) => {
    let data = await DeleteGrade(req.params.id);

    SuccessRespose({res,message: "Grade Deleted",data});
});


// GRADE FEES 

router.get("/grade-fee", auth, async (req, res) => {
    let data = await GradesFee(req.query);
    SuccessRespose({res,message: "All Grades Fees",data});
});


router.post("/add-fee/:id", auth, async (req, res) => {
    let data = await CreateGradeFee(req.body,req.params.id);
    SuccessRespose({res,message: "Grade Fee Created",data});
});


router.put("/update-fee/:id", auth, async (req, res) => {
    let data = await UpdateGradeFee(req.body,req.params.id);

    SuccessRespose({res,message: "Grade Fee Updated",data});
});


//  GET BY ID 
router.get("/:id", auth, async (req, res) => {
    let data = await AllGradesID(req.params.id);
    SuccessRespose({res,message: "Grade",data});
});

export default router