import ccspaceDAO from '../dao/CCSpaceDAO.js'
import AuthMiddleware from '../configurations/auth-middleware.js'
import bcrypt from 'bcrypt'

export default class ccspaceController
{
    //GET OPERATIONS
    static async apiGetWholeSchedule(req, res)
    {
        try
        {
            const WholeSchedule = await ccspaceDAO.returnWholeSchedule()
            res.json(WholeSchedule)
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
            const { sched_id, roomid } = req.body 
            const profid = req.user.prof_id
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeUser(req, res, async () => 
                {
                    const Schedule = await ccspaceDAO.returnSchedule(sched_id, profid, roomid)
                    res.status(200).json({ status: success })
                })
            })
        }
        catch (error)
        {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetLog(req, res)
    {
        try
        {
            const profid = req.user.prof_id
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const log = await ccspaceDAO.getlog()
                    res.status(200).json({ status: success })
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
            const 
            {
                email,
                password,
                first_name,
                last_name,
                middle_name,
                position,
            } = req.body

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
            res.status(201).json({status: success})
        }
        catch (e)
        {
            res.status(500).json({error: e.message})
        }
    }

    static async apiLoginAccount(req, res)
    {
        
            const {email, password} = req.body

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
        
            const token = jwt.sign({ id: loginAccount.id, email: loginAccount.email }, jwtSecret)
            res.json({ message: 'Login successful', token })
            const redirectUrl = '/home'
    }


    static async apiCreateSchedule(req, res) 
    {
        const { time_start, time_end, sub_code, class_section,sched_day, roomid } = req.body;
        const profid = req.user.profid;
          
        try 
        {
            /* Only admins can create schedule
            * applicable when the semester begin
            */
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
          
                    res.status(200).json({ status: success })
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
        const {subjectcode, sessday, sessid, resid, roomid} = req.body
        const { profid } = req.user

        try
        {
            AuthMiddleware.authenticateToken(req, res, () =>
            {
                AuthMiddleware.authorizeUser(req, res, async () =>
                {
                    const RoomTimeIn = await ccspaceDAO.roomtimein(
                        subjectcode,
                        sessday, 
                        sessid, 
                        resid, 
                        profid, 
                        roomid
                    )

                    res.status(200).json({ status: success})
                })
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
            const {user_id} = req.user
            const {newPassword} = req.body.password
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeUser(req, res, async () => 
                {
                    const updatePassword = ccspaceDAO.updatePassword(user_id, hashedPassword)
                    res.status(200).json({ message: 'Schedule created successfully' });
                })
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
            // only admins can update schedule
            const { sched_id, new_time_start, new_time_end, new_sub_code, new_section, new_sched_day, new_prof_id, new_room_id } = req.body;
            const prof_id = req.user.prof_id
            
            AuthMiddleware.authenticateUser(req, res, () => 
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
          
                    res.status(200).json({ message: 'Schedule created successfully' });
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
            const { logid, sessdate } = req.body
            const prof_id  = req.user.prof_id
            AuthMiddleware.authenticateToken(req, res, () => 
            {
                AuthMiddleware.authorizeUser(req, res, async () => 
                {
                    const RoomTimeOut = ccspaceDAO.roomtimeout(logid, sessdate, prof_id)
                    res.status(200).json({ message: 'Schedule created successfully' });
                })
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
            const user_id = req.user.user_id
            AuthMiddleware.authenticateUser(req, res, () => 
            {
                AuthMiddleware.authorizeUser(req, res, async () => 
                {
                    const deleteAccount = await ccspaceDAO.deleteAccount(user_id)
                    res.status(200).json({ error: e.message })
                })
            })
            } catch (error) {

              res.status(500).json({ error: e.message });
            }
    }

    static async apiDeleteSchedule(req, res)
    {
        try
        {
            /* 
            * only admins can delete schedule
            */
            const sched_id = req.body.sched_id
            AuthMiddleware.authenticateUser(req, res, () => 
            {
                AuthMiddleware.authorizeAdmin(req, res, async () => 
                {
                    const deleteSchedule = await ccspaceDAO.deleteSchedule(sched_id)
                    res.status(200).json({ error: e.message })
                })
            })
            } catch (error) {

              res.status(500).json({ error: e.message });
            }
        }
}