import ccspaceController from '../controllers/CCSpace.controller.js'
import authenticateToken from '../configurations/auth-middleware.js'
import express from 'express'

const router = express.Router()

//post route
router.route('/register').post(ccspaceController.apiRegisterAccount)
router.route('/login').post(ccspaceController.apiLoginAccount)
router.post('/:id/create_schedule', authenticateToken, ccspaceController.apiCreateSchedule)
router.post('/time_in/:id', authenticateToken, ccspaceController.apiRoomTimeIn)
router.post('/create_reservation',authenticateToken,ccspaceController.apiCreateReservation)
router.post('/approve_reservation/:id',authenticateToken, ccspaceController.apiApproveReservation)
//get route
router.route('/ccs_schedule').get(ccspaceController.apiGetWholeSchedule)
router.get('/room_schedule/:id', authenticateToken, ccspaceController.apiGetSchedule)
router.get('/:id/ccs_loghistory', authenticateToken, ccspaceController.apiGetLog)

//put route
router.put('/update_password/:id', authenticateToken, ccspaceController.apiUpdatePassword)
router.put('/update_schedule/:id',authenticateToken,ccspaceController.apiUpdateSchedule)
router.put('/time_out/:id',authenticateToken,ccspaceController.apiRoomTimeOut)

//delete route
router.delete('/delete_account/:id', authenticateToken, ccspaceController.apiDeleteAccount)
router.delete('/delet_schedule/:id', authenticateToken, ccspaceController.apiDeleteSchedule)

export default router