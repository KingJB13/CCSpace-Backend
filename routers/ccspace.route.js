import ccspaceController from '../controllers/CCSpace.controller.js'
import authenticateToken from '../configurations/auth-middleware.js'
import express from 'express'

const router = express.Router()

//post route
router.route('/register').post(ccspaceController.apiRegisterAccount)
router.route('/login').post(ccspaceController.apiLoginAccount)
router.post('/home',authenticateToken,ccspaceController.apiAuthorize)
router.post('/:id/create_schedule', authenticateToken, ccspaceController.apiCreateSchedule)
router.post('/time_in/:id', authenticateToken, ccspaceController.apiRoomTimeIn)
router.post('/create_reservation',authenticateToken,ccspaceController.apiCreateReservation)
router.post('/approve_reservation/:id',authenticateToken, ccspaceController.apiApproveReservation)
//get route
router.route('/ccs_schedule').get(ccspaceController.apiGetWholeSchedule)
router.get('/room_schedule/:id', authenticateToken, ccspaceController.apiGetSchedule)
router.get('/prof_schedule', authenticateToken,ccspaceController.apiProfSchedule)
router.get('/:id/ccs_loghistory', authenticateToken, ccspaceController.apiGetLog)
router.get('/reservation_details/:id',authenticateToken, ccspaceController.apiGetReservationDetails)
router.get('/reserved_schedule/:id',authenticateToken,ccspaceController.apiGetReservedScheduleDetails)
router.get('/reserved_schedule',authenticateToken,ccspaceController.apiReservedScheduleDetails)

//put route
router.put('/update_password/:id', authenticateToken, ccspaceController.apiUpdatePassword)
router.put('/update_schedule/:id',authenticateToken,ccspaceController.apiUpdateSchedule)
router.put('/time_out/:id',authenticateToken,ccspaceController.apiRoomTimeOut)

//delete route
router.delete('/delete_account/:id', authenticateToken, ccspaceController.apiDeleteAccount)
router.delete('/delete_schedule/:id', authenticateToken, ccspaceController.apiDeleteSchedule)
router.delete('/reject_reservation',authenticateToken, ccspaceController.apiRejectReservation)

export default router