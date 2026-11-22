import { Router } from "express";
import {auth} from "../../common/middleware/auth/auth.js"
import { SuccessRespose } from "../../common/response/success.response.js";
import { AllFollowUps, completedFollowUp, CreateFollowUp, deleteFollowUp, GetFollowById, getFollowUpCounts, reActiveFollowUp, snoozeFollowUp, UpdateFollowUp } from "./followup.service.js";



const router = Router()


router.get('/search', auth, async (req, res) => {
    let data = await AllFollowUps(req.query)
    SuccessRespose({ res, message: "Reminder", data })
})


router.get('/counts', auth, async (req, res) => {
    let data = await getFollowUpCounts(req.query)
    SuccessRespose({ res, message: "All reminder", data })
})

router.get('/:id', auth, async (req, res) => {
    let data = await GetFollowById(req.params.id)
    SuccessRespose({ res, message: "get reminder", data })
})


router.post('/create', auth, async (req, res) => {
    let data = await CreateFollowUp(req.body , req.user)
    SuccessRespose({ res, message: "Reminder created", data })
})

router.put('/update/:id', auth, async (req, res) => {
    let data = await UpdateFollowUp(req.body , req.params.id)
    SuccessRespose({ res, message: "Reminder updated", data })
})


router.put('/complete/:id', auth, async (req, res) => {
    let data = await completedFollowUp(req.body , req.params.id)
    SuccessRespose({ res, message: "Reminder completed", data })
})

router.put('/snooze/:id', auth, async (req, res) => {
    let data = await snoozeFollowUp(req.body , req.params.id)
    SuccessRespose({ res, message: "Reminder Snoozed", data })
})

router.put('/reActive/:id', auth, async (req, res) => {
    let data = await reActiveFollowUp(req.params.id)
    SuccessRespose({ res, message: "Reminder activeted", data })
})

router.delete('/deleted/:id', auth, async (req, res) => {
    let data = await deleteFollowUp(req.params.id)
    SuccessRespose({ res, message: "Reminder deleted", data })
})


export default router