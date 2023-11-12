import { pool } from '../configurations/database.cjs'

export default class ccspaceDAO{
    //get methods
    static async returnWholeSchedule()
    {
        try 
        {
            const result = await pool.query('call returnwholeschedule()')
            return result.rows
        }
        catch (e)
        {
            console.error(`Unable to get Schedule: ${e}`)
            return {error: e}
        }
    }
    static async returnSchedule(sched_id, profid, roomid)
    {
        try
        {
            const result = await pool.query(`call returnschedule($1, $2, $3)`,[sched_id, profid, roomid])
            return result.rows
        }
        catch (e)
        {
            console.error(`Unable to get Schedule: ${e}`)
            return {error: e}     
        }
    }

    static async getlog()
    {
        try
        {
            const result = await pool.query('getlog()')
            return result.rows[0]
        }
        catch (e)
        {
            console.error(`Unable to get log: ${e}`)
            return { error: e}
        }
    }

    //post methods
    static async registeraccount(email, password, first_name, last_name, middle_name, position)
    {
        try
        {
            const result = await pool.query(`call registeraccount($1, $2, $3, $4, $5, $6)`,[email, password, first_name, last_name, middle_name, position])
            return result.rows[0].ccs_id
        }
        catch (e)
        {
            console.error(`Unable to register account: ${e}`)
            return {error: e}
        }
    }

    static async loginaccount(email, password)
    {
        try
        {
            const result = await pool.query(`call loginaccount($1, $2)`,[email,password])
            
            return result.rows[0]
        }
        catch (e)
        {
            console.error(`Unable to Login Account: ${e}`)
            return {error: e}
        }
    }

    static async createschedule(time_start, time_end, sub_code, class_section , sched_day, profid, roomid)
    {
        try
        {
            const result = await pool.query(`call createschedule($1, $2, $3, $4, $5, $6, $7)`, [time_start, time_end, sub_code, class_section , sched_day, profid, roomid])
            return result.rows[0].schedule_id
        }
        catch (e)
        {
            console.error(`Unable to Create Schedule: ${e}`)
            return {error: e}
        }
    }

    static async roomtimein(subjectcode, class_section, sessday, sessid, resid, profid, roomid)
    {
        try
        {
            const result = await pool.query(`call roomtimein($1, $2, $3, $3, $4, $5, $6, $7)`, [subjectcode, class_section, sessday, sessid, resid, profid, roomid])
            return result.rows[0].log_id
        }
        catch (e)
        {
            console.error(`Unable to log time in: ${e}`)
            return { error: e}
        }
    }

    static async createreservation (vacant_start, vacant_end, reserve_date, subjectcode, reserve_day, class_section, reserve_purpose, schedid, profid, roomid)
    {
        try
        {
            const result = await pool.query(`call createreservation($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [vacant_start, vacant_end, reserve_date, subjectcode, reserve_day, class_section, reserve_purpose, schedid/admin_id, profid, roomid])
            return result.rows[0].reservation_id
        }
        catch (e)
        {
            console.error(`Unable to create reservation: ${e}`)
            return {error: e}
        }
    }

    static async approvedreservation(approve_id, vacant_start, vacant_end, subjectcode, reserve_date, reserve_day, reserve_section, schedid, profid, roomid)
    {
        try
        {
            const result = await pool.query(`call approvedreservation($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,[approve_id, vacant_start, vacant_end, subjectcode, reserve_date, reserve_day, reserve_section, schedid, profid, roomid])
            return result.rows[0].reserved_id
        }
        catch (e)
        {
            console.error(`Unable to create reservation: ${e}`)
            return {error: e}            
        }
    }
    
    //put methods
    static async updatepassword(user_id, password)
    {
        try
        {
            return await pool.query(`call updatepassword($1, $2)`,[user_id,password])
        }
        catch (e)
        {
            console.error(`Unable to update password: ${e}`)
            return {error: e}
        }
    }
    static async updateschedule(sched_id, new_time_start, new_time_end, new_sub_code, new_section, new_sched_day, new_prof_id, new_room_id)
    {
        try
        {
            return await pool.query(`call updateschedule($1, $2, $3, $4, $5, $6, $7)`, [sched_id, new_time_start, new_time_end, new_sub_code, new_section, new_sched_day, new_prof_id, new_room_id])
        }
        catch (e)
        {
            console.error(`Unable to update schedule: ${e}`)
            return {error: e}
        }
    }

    static async roomtimeout(logid, sessdate, prof_id)
    {
        try 
        {
            return await pool.query(`call updateschedule($1, $2, $3)`, [logid, sessdate, prof_id])
        }
        catch (e)
        {
            console.error(`Unable to log time out: ${e}`)
            return { error: e}
        }
    }
    //delete methods
    static async deleteAccount(user_id)
    {
        try
        {
            return await pool.query(`call deleteaccount($1)`,[user_id])
        }
        catch (e)
        {
            console.error(`Unable to delete account: ${e}`)
            return {error: e}
        }
    }
    static async deleteSchedule(sched_id)
    {
        try
        {
            return await pool.query(`call deleteschedule($1)`,[sched_id])
        }
        catch (e)
        {
            console.error(`Unable to delete Schedule: ${e}`)
            return {error: e}
        }
    }
}