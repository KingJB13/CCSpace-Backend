import ccspaceDAO from '../dao/CCSpaceDAO.js'
import AuthMiddleware from '../configurations/auth-middleware.js'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import jwtSecret from '../configurations/constants.js'
function jwtGenerator(user_id){
    const credentials ={
        user: {
            id: user_id
        }
    }
    return jwt.sign(credentials, jwtSecret, {expiresIn: "24h"})
}
const sqlInjectionCheck = (value) => {

    const isSafe = !value.includes('DROP') && !value.includes('DELETE') && !value.includes('UPDATE')
    return isSafe
  };
const sqlInjectionCheckText = (value) => {
    const isSafe = !/[;'"\\]/.test(value)
    return isSafe
}

export default class ccspaceController
{
    //GET OPERATIONS
    static async apiGetWholeSchedule(req, res)
    {
        try
        {
            AuthMiddleware.authenticateToken(req, res, ()=>{
                AuthMiddleware.authorizeAdmin(req, res, async ()=>{
                    const WholeSchedule = await ccspaceDAO.returnWholeSchedule()
                    res.status(200).json(WholeSchedule)
                })
            })
        }
        catch (error)
        {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetSchedule(req, res)
    {
        try
        {
            const validationRules =[
                body('sched_id').isNumeric(),
                body('roomid').isNumeric
            ]
            const { sched_id, roomid } = req.body 

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res,async () => 
            {
                    const Schedule = await ccspaceDAO.returnSchedule(sched_id, roomid)
                    res.status(200).json(Schedule)
                
            })
        }
        catch (error)
        {
            res.status(500).json({error: e.message})
        }
    }

    static async apiProfSchedule(req, res)
    {
        try
        {
            const validationRules = [
                body('sched_id').isNumeric(),
                body('roomid').isNumeric
            ]
            const {sched_id, roomid} = req.body
            const prof_id = req.user.id
    
            await Promise.all(validationRules.map(validation => validation.run(req)))
    
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res, async ()=>{
                const ProfSchedule = await ccspaceDAO.profSchedule(sched_id, roomid, prof_id)
                return res.status(200).json(ProfSchedule)
            })

        }
        catch (error)
        {

        }
    }

    static async apiGetLog(req, res)
    {
        try
        {
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const log = await ccspaceDAO.getlog()
                    res.status(200).json(log)
                })
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }

    }

    static async apiGetReservationDetails(req, res)
    {
        try
        {
            const profid = req.user.id
            AuthMiddleware.authenticateToken(req, res, async () => 
            {
                    const reservationdetails = await ccspaceDAO.getreservationdetails(profid)
                    res.status(200).json(reservationdetails)
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message })
        }
    }
    static async apiGetReservedScheduleDetails(req, res)
    {
        //for professors
        try
        {
            const profid = req.user.id
            AuthMiddleware.authenticateToken(req, res, async () => 
            {
                    const reservedscheduledetails = await ccspaceDAO.getreservedscheduledetails(profid)
                    res.status(200).json(reservedscheduledetails)
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message })
        }
    }
    static async apiReservedScheduleDetails(req, res)
    {
        //for admin
        try
        {
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const reservedscheduledetails = await ccspaceDAO.reservedscheduledetails()
                    res.status(200).json(reservedscheduledetails)
                })
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }
    }

    //POST OPERATIONS

    static async apiRegisterAccount(req, res)
    {
        try
        {
            const validationRules = [
                body('email').isEmail().isLength({min:10, max: 30}).custom(value => sqlInjectionCheck(value)),
                body('password').isString().isLength({min: 8, max: 32}).custom(value => sqlInjectionCheck(value)),
                body('first_name').isString().isLength({min: 2, max: 25}).custom(value => sqlInjectionCheck(value)),
                body('last_name').isString().isLength({min: 2, max: 25}).custom(value => sqlInjectionCheck(value)),
                body('middle_name').isString().isLength({min: 2, max: 25}).custom(value => sqlInjectionCheck(value)),
                body('position').isString().isLength({min: 4, max: 20}).custom(value => sqlInjectionCheck(value))
            ]
            const 
            {
                email,
                password,
                first_name,
                last_name,
                middle_name,
                position,
            } = req.body
            
            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }
            
            const check = await(ccspaceDAO.checkexist(email))
            if(check !== 0)
            {
                res.status(401).json("User already exist!")
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const registerAccount = await ccspaceDAO.registeraccount
            (
                email, 
                hashedPassword, 
                first_name, 
                last_name, 
                middle_name, 
                position,
            )
            res.status(200).json(registerAccount)
        }
        catch (e)
        {
            res.status(500).json({error: e.message})
        }
    }

    static async apiLoginAccount(req, res)
    {
            const validationRules = [
                body('email').isEmail().isLength({min:10, max: 30}).custom(value => sqlInjectionCheck(value)),
                body('password').isString().isLength({min: 8, max: 32}).custom(value => sqlInjectionCheck(value))
            ]

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            const { email, password } = req.body

            const loginAccount = await ccspaceDAO.loginaccount(email,password)
            if(!loginAccount)
            {
                return res.status(401).json({error: e.message})
            }
            const passwordValidation = await bcrypt.compare(password,loginAccount.password)
            if(!passwordValidation)
            {
                res.status(401).json({error: e.message})
            }
        
            const jwtToken = jwtGenerator(loginAccount.ccs_id)
            res.status(200).json(jwtToken)
    }

    static async apiAuthorize(req, res){
        try{
            const ccs_id = req.user.id
            const Authorize = await ccspaceDAO.authorize(ccs_id)
            res.status(200).json(Authorize)
        }
        catch(error)
        {
            res.status(500).json({error: e.message})
        }
    }


    static async apiCreateSchedule(req, res) 
    {   
            /* Only admins can create schedule
            * applicable when the semester begin
            */
        try 
        {
            const validationRules = [
                body('time_start').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('time_end').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('sub_code').isString().isLength({max:10}).custom(value => sqlInjectionCheck(value)),
                body('class_section').isString().isLength({min:7, max:10}).custom(value => sqlInjectionCheck(value)),
                body('sched_day').isDate().isISO8601('yyyy-mm-dd'),
                body('roomid').isNumeric(),
            ]
            const { time_start, time_end, sub_code, class_section,sched_day, roomid } = req.body
            const profid = req.user.id
            
            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const createSchedule = await ccspaceDAO.createschedule(
                        time_start,
                        time_end,
                        sub_code,
                        class_section,
                        sched_day,
                        profid,
                        roomid
                    )
          
                    res.status(200).json(createSchedule)
                })
            })
        } 
        catch (error) 
        {
            res.status(500).json({ error: e.message })
        }
    }
    
    static async apiRoomTimeIn(req, res)
    {
        try
        {
            const validationRules = [
                body('sub_code').isString().isLength({max:10}).custom(value => sqlInjectionCheck(value)),
                body('class_section').isString().isLength({min:7, max:10}).custom(value => sqlInjectionCheck(value)),
                body('sessday').isString().isLength({min:6 , max:9}).custom(value => sqlInjectionCheck(value)),
                body('sessid').isNumeric(),
                body('resid').isNumeric(),
                body('roomid').isNumeric(),
            ]

            const { subjectcode, sessday, sessid, resid, roomid } = req.body
            const profid = req.user.id

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }
            AuthMiddleware.authenticateToken(req, res, async () =>
            {
                    const RoomTimeIn = await ccspaceDAO.roomtimein(
                        subjectcode,
                        sessday, 
                        sessid, 
                        resid, 
                        profid, 
                        roomid
                    )
                    res.status(200).json(RoomTimeIn)
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }
    }

    static async apiCreateReservation(req, res)
    {
        try
        {
            const validationRules = [
                body('vacant_start').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('vacant_end').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('reserve_date').isISO8601('yyyy-mm-dd'),
                body('subjectcode').isString().isLength({max:10}).custom(value => sqlInjectionCheck(value)),
                body('reserve_day').isLength({min:6 , max:9}).custom(value => sqlInjectionCheck(value)),
                body('class_section').isString().isLength({min:7, max:10}).custom(value => sqlInjectionCheck(value)),
                body('reserve_purpose').isString().isLength({min:20, max: 255}).custom(value => sqlInjectionCheckText(value)),
                body('schedid').isNumeric,
                body('roomid').isNumeric
            ]
            const { vacant_start, vacant_end, reserve_date, subjectcode, reserve_day, class_section, reserve_purpose, schedid, roomid } = req.body
            const profid = req.user.id
    
            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }
            AuthMiddleware.authenticateToken(req, res, () =>
            {
                AuthMiddleware.authorizeAdmin(req, res, async () =>
                {
                    const CreateReservation = await ccspaceDAO.createreservation(
                        vacant_start, 
                        vacant_end, 
                        reserve_date, 
                        subjectcode, 
                        reserve_day, 
                        class_section, 
                        reserve_purpose, 
                        schedid, 
                        profid, 
                        roomid
                    )

                    res.status(200).json(CreateReservation)
                })
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }
    }

    static async apiApproveReservation(req, res)
    {
        try
        {
            const validationRules = [
                body['approved_id'].isNumeric(),
                body('vacant_start').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('vacant_end').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('reserve_date').isISO8601('yyyy-mm-dd'),
                body('subjectcode').isString().isLength({max:10}).custom(value => sqlInjectionCheck(value)),
                body('reserve_day').isLength({min:6 , max:9}).custom(value => sqlInjectionCheck(value)),
                body('class_section').isString().isLength({min:7, max:10}).custom(value => sqlInjectionCheck(value)),
                body('reserve_purpose').isString().isLength({min:20, max: 255}).custom(value => sqlInjectionCheckText(value)),
                body('schedid').isNumeric,
                body('roomid').isNumeric
            ]
            const { 
                approve_id,
                vacant_start, 
                vacant_end, 
                subjectcode, 
                reserve_date, 
                reserve_day, 
                reserve_section, 
                schedid,  
                roomid } = req.body
            const profid  = req.user.id

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }
            
            AuthMiddleware.authenticateToken(req, res,async () =>
            {
                    const ApprovedReservation = await ccspaceDAO.approvedreservation( 
                        approve_id,
                        vacant_start, 
                        vacant_end, 
                        subjectcode, 
                        reserve_date, 
                        reserve_day, 
                        reserve_section, 
                        schedid, 
                        profid, 
                        roomid
                    )
                    res.status(200).json(ApprovedReservation)

            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }

    }

    //PUT OPERATIONS
    static async apiUpdatePassword(req, res)
    {
        try
        {
            // the new password passed to the backend is confirmed and matched the user's old password

            const validationRules = [
                body('newPassword').isString().isLength({min: 8, max: 32}).custom(value => sqlInjectionCheck(value))
            ]

            const user_id  = req.user.id
            const { newPassword } = req.body.password
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                    const updatePassword = ccspaceDAO.updatePassword(user_id, hashedPassword)
                    res.status(200).json(updatePassword)
            })
        }
        catch (e)
        {
            res.status(500).json({error: e.message})
        }
    }
    static async apiUpdateSchedule(req, res)
    {
        try {
            const validationRules =[
                body('sched_id').isNumeric(),
                body('new_time_start').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('new_time_end').matches('^([0-9]|0[0-9]|1[0-9]|2[0-3])$'),
                body('new_sub_code').isString().isLength({max:10}).custom(value => sqlInjectionCheck(value)),
                body('new_section').isString().isLength({min:7, max:10}).custom(value => sqlInjectionCheck(value)),
                body('new_sched_day').isDate().isISO8601('yyyy-mm-dd'),
                body('new_prof_id').isNumeric(),
                body('new_room_id').isNumeric()
            ]
            // only admins can update schedule
            const { sched_id, new_time_start, new_time_end, new_sub_code, new_section, new_sched_day, new_prof_id, new_room_id } = req.body
            
            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }
            
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const updateSchedule = await ccspaceDAO.updateSchedule(
                        sched_id, 
                        new_time_start, 
                        new_time_end, 
                        new_sub_code, 
                        new_section, 
                        new_sched_day, 
                        new_prof_id, 
                        new_room_id
                    );
          
                    res.status(200).json(updateSchedule)
                })
            })
            } catch (error) {

              res.status(500).json({ message: 'Internal server error' })
            }
    }

    static async apiRoomTimeOut(req, res)
    {
        try
        {
            const validationRules =[
                body('logid').isNumeric,
                body('sessdate').isISO8601('yyyy-mm-dd')
            ]
            const { logid, sessdate } = req.body
            const prof_id  = req.user.id

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res, () => 
            {
                    const RoomTimeOut = ccspaceDAO.roomtimeout(logid, sessdate, prof_id)
                    res.status(200).json(RoomTimeOut)
            })
        }
        catch (error)
        {
            res.status(500).json({ message: 'Internal server error' })
        }
    }
    //DELETE OPERATIONS
    static async apiDeleteAccount(req, res) 
    {
        /* deletes account of the user
        * gets called if the user agreed to terms of deletion
        */
        try 
        {
            const user_id = req.user.id
            AuthMiddleware.authenticateToken(req, res, async () => 
            {
                    const deleteAccount = await ccspaceDAO.deleteAccount(user_id)
                    res.status(200).json(deleteAccount)
            })
            } catch (error) {

              res.status(500).json({ error: e.message })
            }
    }

    static async apiDeleteSchedule(req, res)
    {
        try
        {
            /* 
            * only admins can delete schedule
            */
            const validationRules =[body('rejected_id').isNumeric]
            const sched_id = req.body.sched_id

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () =>{
                    const deleteSchedule = await ccspaceDAO.deleteSchedule(sched_id)
                    res.status(200).json(deleteSchedule)
                })
            })
            } catch (error) {

              res.status(500).json({ error: e.message })
            }
    }

    static async apiRejectReservation(req, res)
    {
        try
        {
            const validationRules =[body('rejected_id').isNumeric]

            const rejected_id = req.body.rejected_id

            await Promise.all(validationRules.map(validation => validation.run(req)))

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() })
            }

            AuthMiddleware.authenticateToken(req, res, async () => 
            {
                    const log = await ccspaceDELETE.rejectreservation(rejected_id)
                    res.status(200).json({ status: success })
            })
        }
        catch (error)
        {
            res.status(500).json({ error: e.message})
        }
    }
}