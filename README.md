# CCSpace-Backend
-initialize node
Terminal:
  npm init

-install dependencies
Terminal:
  npm install express bcrypt cors pg jsonwebtoken

- add "type" : "module" on package.json file


Tables:
CREATE TABLE IF NOT EXISTS ccspace_user (ccs_id INT PRIMARY KEY, ccs_email VARCHAR(50),
						  ccs_password VARCHAR(35), 
						  ccs_firstname VARCHAR(25), 
						  ccs_lastname VARCHAR(25), 
						  ccs_middlename VARCHAR(25),
						  ccs_position VARCHAR(20)); 
						  
CREATE TABLE IF NOT EXISTS ccspace_room (room_id INT PRIMARY KEY, room_name VARCHAR(20), room_type VARCHAR(15));

CREATE TABLE IF NOT EXISTS ccspace_schedule(schedule_id INT PRIMARY KEY,
							 duration_start TIME, 
							 duration_end TIME,
							 subject_code VARCHAR(10),
							 section VARCHAR(20),
							 schedule_day VARCHAR(20),
							 prof_id INT,
							 ccsroom_id INT,
							 FOREIGN KEY(prof_id) REFERENCES ccspace_user(ccs_id) ON DELETE CASCADE,
							 FOREIGN KEY(ccsroom_id) REFERENCES ccspace_room(room_id) ON DELETE CASCADE,
							 CONSTRAINT time_start_constraint CHECK (duration_start >= TIME '07:00' AND duration_start <= TIME '17:30'),
							 CONSTRAINT time_end_constraint CHECK (duration_end >= TIME '08:30' AND duration_end <= TIME '19:00') 
							 );
CREATE TABLE IF NOT EXISTS ccspace_reservation(reservation_id INT PRIMARY KEY,
								 time_vacant_start TIME,
								 time_vacant_end TIME,
								 subject_code VARCHAR(10),
								 section VARCHAR(20),
								 reservation_date DATE,
								 reservation_day VARCHAR(10),
								 purpose VARCHAR(255),
								 sched_id INT,
								 professor_id INT,
								 room_id INT,
								 FOREIGN KEY (schedid) REFERENCES ccspace_schedule(schedule_id) ON DELETE CASCADE,
								 FOREIGN KEY (roomid) REFERENCES ccspace_room(room_id) ON DELETE CASCADE,
								 FOREIGN KEY(profid) REFERENCES ccspace_user(ccs_id) ON DELETE CASCADE,
								 CONSTRAINT time_start_vacant CHECK (time_vacant_start >= TIME '07:00' AND time_vacant_start <= TIME '17:30'),
							 	 CONSTRAINT time_end_vacant CHECK (time_vacant_end >= TIME '08:30' AND time_vacant_end <= TIME '19:00'),
								 CONSTRAINT reservation_start_constraint CHECK (reservation_start >= TIME '07:00' AND reservation_start <= TIME '17:30'),
								 CONSTRAINT reservation_end_constraint CHECK (reservation_end >= TIME '08:30' AND reservation_end <= TIME '19:00') 
								 
								);
CREATE TABLE IF NOT EXISTS reserved_schedule(reserved_id INT PRIMARY KEY,
							   reserved_start TIME,
							   reserved_end TIME,
							   subject_code VARCHAR(10),
							   section VARCHAR(20),
							   reserved_date DATE,
							   reserved_day VARCHAR(20),							   
							   schedid INT,
							   profid INT,
							   roomid INT,
							   FOREIGN KEY (schedid) REFERENCES ccspace_schedule(schedule_id) ON DELETE CASCADE,
							   FOREIGN KEY(profid) REFERENCES ccspace_user(ccs_id) ON DELETE CASCADE,
							   FOREIGN KEY (roomid) REFERENCES ccspace_room(room_id) ON DELETE CASCADE,
							   CONSTRAINT reserved_start_constraint CHECK (reserved_start >= TIME '07:00' AND reserved_start <= TIME '17:30'),
							   CONSTRAINT reserved_end_constraint CHECK (reserved_end >= TIME '08:30' AND reserved_end <= TIME '19:00')
							  );
CREATE TABLE IF NOT EXISTS ccspace_log(log_id INT,
						 log_start TIME,
						 log_end TIME,
						 subject_code VARCHAR(10),
						 session_date DATE,
						 session_day VARCHAR(20),
						 time_in_remarks VARCHAR(30),
						 time_out_remarks VARCHAR(30),
						 session_id INT,
						 reserved_id INT,
						 professor_id INT,
						 room_id INT,
						 FOREIGN KEY(session_id) REFERENCES ccspace_schedule(schedule_id) ON DELETE CASCADE,
						 FOREIGN KEY(reserved_id) REFERENCES reserved_schedule(reserved_id) ON DELETE CASCADE,
						 FOREIGN KEY(professor_id) REFERENCES ccspace_user(ccs_id) ON DELETE CASCADE,
					     FOREIGN KEY (roomid) REFERENCES ccspace_room(room_id) ON DELETE CASCADE,
						 CONSTRAINT log_start_constraint CHECK (log_start >= TIME '07:00' AND log_start <= TIME '17:30'),
						 CONSTRAINT log_end_constraint CHECK (log_end >= TIME '08:30' AND log_end <= TIME '19:00')
						);

*REGISTERACCOUNT*
CREATE OR REPLACE PROCEDURE registeraccount(IN email VARCHAR(50),
                                            IN password VARCHAR(35),
                                            IN first_name VARCHAR(25),
                                            IN last_name VARCHAR(25),
                                            IN middle_name VARCHAR(25),
                                            IN position VARCHAR(20)
                                            )
LANGUAGE plpgsql
AS 
$$
BEGIN
    IF (email LIKE '%@dhvsu.edu.ph') THEN
		INSERT INTO ccspace_user 
		(
		 ccs_id,
		 ccs_email,
		 ccs_password, 
		 ccs_firstname,
		 ccs_lastname,
		 ccs_middlename,
		 ccs_position
		)
		VALUES 
		(
		 FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000),
		 email,
		 password,
		 first_name,
		 last_name,
		 middle_name,
		 position
		) RETURNING *;
	ELSE
		RAISE NOTICE 'NOT A DHVSU EMAIL OR EMAIL INSERTED ALREADY EXISTS';
	END IF;
END;
$$;



*LOGIN ACCOUNT*

CREATE OR REPLACE PROCEDURE loginaccount(IN email VARCHAR(50),
                                            IN password VARCHAR(35),
                                            )
LANGUAGE plpgsql
AS 
$$
BEGIN
	IF (email LIKE '%@dhvsu.edu.ph') THEN
		SELECT * FROM ccspace_user WHERE ccs_email = email AND ccs_password = password;
	ELSE 
	RAISE NOTICE 'NOT A DHVSU EMAIL OR EMAIL INSERTED ALREADY EXISTS';
	END IF;	
END;
$$;



*UPDATE PASSWORD*

CREATE OR REPLACE PROCEDURE updatepassword(IN user_id INT, IN password VARCHAR(35))
LANGUAGE plpgsql
AS
$$
BEGIN
	IF EXISTS (SELECT 1 FROM ccspace_user WHERE ccs_id = id) THEN
		UPDATE ccspace_user SET ccs_password = password WHERE ccs_id = user_id;
	ELSE 
		RAISE NOTICE 'User id does not exist';
	END IF;
END;
$$;

*DELETE ACCOUNT*

CREATE OR REPLACE PROCEDURE deleteaccount(IN user_id INT)
LANGUAGE plpgsql
AS
$$
BEGIN
	IF EXISTS (SELECT 1 FROM ccspace_user WHERE ccs_id = id) THEN
		DELETE FROM ccspace_user WHERE ccs_id = id;
	ELSE 
		RAISE NOTICE 'User ID does not exist';
	END IF;
END;
$$;


*CREATESCHEDULE*
CREATE OR REPLACE PROCEDURE createschedule(IN time_start TIME,
                                 IN time_end TIME,
                                 IN sub_code VARCHAR(10),
				 IN class_section VARCHAR(20),
                                 IN sched_day VARCHAR(20),
                                 IN profid INT,
                                 IN roomid INT)
LANGUAGE plpgsql
AS
$$
BEGIN
    IF sched_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') THEN
            IF ((time_end - time_start) = interval '1 hour 30 minutes' OR
                (time_end - time_start) = interval '3 hours') THEN

                -- Check if there's a schedule overlap
                IF NOT EXISTS (
                    SELECT 1 FROM ccspace_schedule
                    WHERE schedule_day = sched_day
                    AND (time_start, time_end) OVERLAPS (duration_start, duration_end)
                ) THEN
                    INSERT INTO ccspace_schedule (schedule_id, duration_start, duration_end, subject_code, section, schedule_day, prof_id, ccsroom_id)
                    VALUES (FLOOR(RANDOM() * (3000000 - 2000000 + 1)) + 2000000, time_start, time_end, sub_code, class_section, sched_day, profid, roomid)
                    RETURNING *;
                ELSE
                    RAISE NOTICE 'Schedule already exists for the given day, start time, and end time';
                END IF;
            ELSE
                RAISE NOTICE 'Invalid interval. The schedule should be either 1 hour 30 minutes or 3 hours.';
            END IF;
    ELSE 
        RAISE NOTICE 'Weekday does not exist';
    END IF;
END;
$$;


*UPDATE SCHEDULE*
CREATE OR REPLACE PROCEDURE updateschedule(IN sched_id INT,
                                           IN new_time_start TIME,
                                           IN new_time_end TIME,
                                           IN new_sub_code VARCHAR(20),
                                           IN new_section VARCHAR(30),
					   IN new_sched_day VARCHAR(20),
                                           IN new_prof_id INT,
                                           IN new_room_id INT
                                          )
LANGUAGE plpgsql
AS
$$
BEGIN
    -- Check if the new weekday is valid
    IF new_sched_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') THEN
        -- Check if the schedule with the provided sched_id exists
        IF EXISTS (SELECT 1 FROM ccspace_schedule WHERE schedule_id = sched_id) THEN
            -- Check for time overlaps with existing schedules on the same weekday
            IF NOT EXISTS (
                SELECT 1
                FROM ccspace_schedule
                WHERE schedule_id <> sched_id 
                  AND schedule_day = new_sched_day
                  AND (new_time_start, new_time_end) OVERLAPS (duration_start, duration_end)
            ) THEN
                -- Update the schedule
                UPDATE ccspace_schedule
                SET
                    duration_start = new_time_start,
                    duration_end = new_time_end,
                    subject_code = new_sub_code,
		    section = new_section,
                    schedule_day = new_sched_day,
                    prof_id = new_prof_id,
		    ccsroom_id = new_room_id    
                WHERE schedule_id = sched_id;
            ELSE
                RAISE NOTICE 'Time overlap with an existing schedule on the same weekday';
            END IF;
        ELSE
            RAISE NOTICE 'Schedule with schedule id % does not exist.', sched_id;
        END IF;
    ELSE 
        RAISE NOTICE 'Invalid weekday';
    END IF;
END;
$$;

*DELETE SCHEDULE*
CREATE OR REPLACE PROCEDURE deleteschedule(IN sched_id INT)
LANGUAGE plpgsql
AS
$$
BEGIN
    
    -- Check if the schedule with the given sched_id exists
    IF EXISTS (SELECT 1 FROM ccspace_schedule WHERE schedule_id = sched_id) THEN
        -- Delete the schedule with the provided sched_id
        DELETE FROM ccspace_schedule WHERE schedule_id = sched_id;
    ELSE
        RAISE NOTICE 'Schedule with schedule id % does not exist.', sched_id;
    END IF;
END;
$$;

*RETURN SCHEDULE*
CREATE OR REPLACE PROCEDURE returnschedule(IN sched_id INT, IN profid INT, IN roomid INT)
LANGUAGE plpgsql
AS
$$
BEGIN
	SELECT * FROM ccspace_schedule 
	INNER JOIN ccspace_room ON ccspace_schedule.ccsroom_id = ccspace_room.room_id
	INNER JOIN ccspace_user ON ccspace_schedule.prof_id = ccspace_user.ccs_id
	WHERE ccspace_schedule.schedule_id = sched_id AND ccspace_room.room_id = roomid AND ccspace_user.ccs_id = profid; 
END;
$$;

*RETURN WHOLE SCHEDULE*
CREATE OR REPLACE PROCEDURE returnwholeschedule()
LANGUAGE plpgsql
AS
$$
BEGIN
	SELECT * FROM ccspace_schedule 
	INNER JOIN ccspace_room ON ccspace_schedule.ccsroom_id = ccspace_room.room_id
	INNER JOIN ccspace_user ON ccspace_schedule.prof_id = ccspace_user.ccs_id;
END;
$$;

*CREATE TIME IN LOG* 
CREATE OR REPLACE PROCEDURE roomtimein(
    IN subjectcode VARCHAR(10),
    IN sessday VARCHAR(20),
    IN sessid INT,
    IN resid INT,
    IN profid INT,
    IN roomid INT
)
LANGUAGE plpgsql 
AS
$$
BEGIN
    IF resid IS NULL AND sessid IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM ccspace_log
            WHERE session_id = sessid AND log_start >= NOW()
            AND NOT EXISTS (
                SELECT 1
                FROM ccspace_schedule
                WHERE ccspace_schedule.schedule_id = sessid
                AND ccspace_schedule.subject_code = subjectcode
            )
	    AND NOT EXISTS (SELECT 1 FROM ccspace_user WHERE ccspace_user.ccs_id = profid)
            AND NOT EXISTS(SELECT 1 FROM ccspace_room WHERE ccspace_room.room_id = roomid)
        ) THEN
            INSERT INTO ccspace_log(log_id, log_start, subject_code, session_date, session_day, log_timein_remarks, session_id, reserved_id, professor_id, room_id)
            VALUES (
                FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000),
                CURRENT_TIME,
		subjectcode,
                CURRENT_DATE(),
                sessday,
		CASE
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start = time_in) THEN 'On Time'
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start > time_in) THEN 'Late'
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start < time_in) THEN 'Early'
                ELSE 'Unknown'
                END,
                sessid,
		NULL,
                profid,
                roomid
            );
        ELSE
            RAISE NOTICE 'Room is occupied or scheduling conflict.';
        END IF;

    ELSIF sess_id IS NULL AND res_id IS NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM ccspace_log
            WHERE session_id IS NULL AND reserved_id IS NULL
            AND log_start <= CURRENT_TIME
            AND session_date = NOW()
            AND session_day = sessday
            AND subject_code = subjectcode
            AND room_id = roomid
        ) THEN
            INSERT INTO ccspace_log(log_id, log_start, subject_code, session_date, session_day, log_timein_remarks, session_id, reserved_id, professor_id, room_id)
            VALUES (
                FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000),
                CURRENT_TIME,
		subjectcode,
                CURRENT_DATE(),
                sessday,
		'Not Reserved nor Scheduled',
                sessid,
		NULL,
                profid,
                roomid
		);
        ELSE
            RAISE NOTICE 'Room is occupied or conflicting schedule.';
        END IF;

    ELSIF sessid IS NULL AND resid IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM ccspace_log
            WHERE reserved_id = resid AND log_start >= NOW()
            AND NOT EXISTS (
                SELECT 1
                FROM reserved_schedule
                WHERE reserved_schedule.reserved_date = sessDate
                AND reserved_schedule.reserved_day = sessDay
                AND reserved_schedule.subjectcode = subjectcode
            ) AND NOT EXISTS (SELECT 1 FROM ccspace_user WHERE ccspace_user.ccs_id = prof_id)
            AND NOT EXISTS(SELECT 1 FROM ccspace_room WHERE ccspace_room.room_id = room_id)
        ) THEN
	    INSERT INTO ccspace_log(log_id, log_start, subject_code, session_date, session_day, log_timein_remarks, session_id, reserved_id, professor_id, room_id)
            VALUES (
                FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000),
                CURRENT_TIME,
		subjectcode,
                CURRENT_DATE(),
                sessday,
		CASE
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start = time_in) THEN 'On Time'
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start > time_in) THEN 'Late'
                    WHEN EXISTS (SELECT 1 FROM ccspace_schedule WHERE ccspace_schedule.duration_start < time_in) THEN 'Early'
                ELSE 'Unknown'
                END,
                NULL,
		resid,
                profid,
                roomid
            );
        ELSE 
            RAISE NOTICE 'Room is occupied or reservation conflict.';
        END IF;
    ELSE 
        RAISE NOTICE 'Room is occupied';
    END IF;
END;
$$;

*GET TIME IN LOG* 

CREATE OR REPLACE PROCEDURE getlog()
LANGUAGE plpgsql
AS
$$
BEGIN
	SELECT * FROM ccspace_log 
	JOIN reserved_schedule ON reserved_schedule.reserved_id = ccspace_log.reserved_id
	JOIN ccspace_schedule ON ccspace_schedule.schedule_id = ccspace_log.session_id
    	JOIN ccspace_user ON ccspace_user.ccs_id = ccspace_log.professor_id
	JOIN ccspace_room ON ccspace_room.room_id = ccspace_log.room_id;
END;
$$;

*GET PROFESSOR LOG*
CREATE OR REPLACE PROCEDURE getproflog(IN prof_id INT)
LANGUAGE plpgsql
AS
$$
BEGIN
	SELECT * FROM ccspace_log 
	JOIN reserved_schedule ON reserved_schedule.reserved_id = ccspace_log.reserved_id
	JOIN ccspace_schedule ON ccspace_schedule.schedule_id = ccspace_log.session_id
    	JOIN ccspace_user ON ccspace_user.ccs_id = ccspace_log.professor_id
	JOIN ccspace_room ON ccspace_room.room_id = ccspace_log.room_id
	WHERE ccspace_log.professor_id = prof_id;
END;
$$;

*UPDATE TIME OUT LOG AND REMARKS* 

CREATE OR REPLACE PROCEDURE roomtimeout(
    IN logid INT, 
    IN sessdate DATE,
    IN prof_id INT
)
LANGUAGE plpgsql AS
$$
BEGIN
    IF EXISTS(
        SELECT 1
        FROM ccspace_log
        WHERE log_id = logid AND professor_id = prof_id AND session_date = sessdate
    ) THEN
        IF EXISTS(
            SELECT 1
            FROM ccspace_log
            WHERE log_id = logid AND professor_id = prof_id
            AND EXISTS (SELECT 1 FROM reserved_schedule WHERE reserved_schedule.duration_end = CURRENT_TIME)
        ) THEN
            UPDATE ccspace_log
            SET log_end = CURRENT_TIME, log_timeout_remarks = 'On Time'
            WHERE log_id = id AND professor_id = prof_id;

        ELSIF EXISTS(
            SELECT 1
            FROM ccspace_log
            WHERE log_id = logid AND professor_id = prof_id
            AND EXISTS (SELECT 1 FROM reserved_schedule WHERE reserved_schedule.duration_end < CURRENT_TIME)
        ) THEN
            UPDATE ccspace_log
            SET log_end = CURRENT_TIME, log_timeout_remarks = 'Overtime'
            WHERE log_id = logid AND professor_id = prof_id;

        ELSIF EXISTS(
            SELECT 1
            FROM ccspace_log
            WHERE log_id = logid AND professor_id = prof_id
            AND EXISTS (SELECT 1 FROM reserved_schedule WHERE reserved_schedule.durationend > CURRENT_TIME)
        ) THEN
            UPDATE ccspace_log
            SET log_end = CURRENT_TIME, log_timeout_remarks = 'Early Dismissal'
            WHERE log_id = logid AND professor_id = prof_id;

        ELSIF EXISTS(
            SELECT 1 
            FROM ccspace_log 
            WHERE log_id = logid AND professor_id = prof_id AND log_timein_remarks = 'Not Reserved nor Scheduled'
        ) THEN
	    UPDATE ccspace_log 
	    SET log_end = CURRENT_TIME, logout_time_remarks = 'Not Reserved nor Scheduled'
            WHERE log_id = logid AND professor_id = prof_id;
	
        ELSE
            RAISE NOTICE 'Unknown Schedule';
        END IF;
    ELSE
        RAISE NOTICE 'Log not found for the given log id and professor.';
    END IF;
END;
$$;

*CREATE RESERVATION*
CREATE OR REPLACE PROCEDURE createreservation(
								IN vacant_start TIME,
								IN vacant_end TIME,
                                IN subjectcode VARCHAR(10),
								IN reserve_date DATE,
								IN reserve_day VARCHAR(10),
								IN class_section VARCHAR(20),
								IN reserve_purpose VARCHAR(255),
								IN schedid INT,
                                IN profid INT,
								IN roomid INT
)
LANGUAGE plpgsql
AS 
$$
DECLARE 
	admin_ids INT[];
	admin_id INT;
BEGIN
	admin_ids := ARRAY(
		SELECT ccs_id INTO admin_id
		FROM ccspace_user 
		WHERE position = 'chairperson' or position = 'dean'
    );
	
	FOREACH admin_id IN ARRAY admin_ids
	LOOP
		IF NOT EXISTS(SELECT 1 FROM ccspace_schedule 
					 WHERE schedule_id = schedid
					 AND duration_start = vacant_start
                     AND subject_code = subjectcode
                     AND section = class_section
					 AND duration_end = vacant_end
					 AND reservation_day = reserve_day
					 AND prof_id = profid) THEN

						INSERT INTO ccspace_reservation(reservation_id, time_vacant_start, time_vacant_end, subject_code, section, reservation_date, reservation_day, purpose, professor_id, room_id)
						VALUES (FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000), vacant_start, vacant_end, subjectcode, class_section, reserve_date, reserve_day, reserve_purpose, admin_id, roomid);
		ELSE
			INSERT INTO ccspace_reservation(reservation_id, time_vacant_start, time_vacant_end, subject_code, reservation_date, reservation_day, section, purpose, sched_id, professor_id, room_id)
			VALUES (FLOOR(RANDOM() * (3000000 - 2000000 + 1) + 2000000), vacant_start, vacant_end, reserve_date, subjectcode, reserve_day, class_section, reserve_purpose, schedid, profid, roomid);
		END IF;
	END LOOP;
END;
$$;

*GET RESERVATION DETAILS* 
CREATE OR REPLACE PROCEDURE getreservationdetails(
    IN profid INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT *
    FROM ccspace_reservation
    WHERE professor_id = profid;
END;
$$;

*DELETE RESERVATION REQUEST IF REJECTED*
CREATE OR REPLACE PROCEDURE rejectreservation(IN rejected_id INT)
LANGUAGE plpgsql 
AS
$$
BEGIN
	IF EXISTS(SELECT 1 FROM ccspace_reservation WHERE reservation_id = rejected_id) THEN
		DELETE FROM ccspace_reservation WHERE reservation_id = rejected_id;
	ELSE 
		RAISE NOTICE 'Reservation request does not exist';
	END IF;
END;
$$;

*CREATE RESERVATION SCHEDULE WHERE IT ALSO DELETES THE REQUEST*
CREATE OR REPLACE PROCEDURE approvedreservation(IN approve_id INT,
								 IN vacant_start TIME,
								 IN vacant_end TIME,
								 IN subjectcode VARCHAR(10),
                                 IN reserve_section VARCHAR(20),
								 IN reserve_date DATE,
								 IN reserve_day VARCHAR(10),
								 IN schedid INT,
								 IN profid INT,
								 IN roomid INT)
LANGUAGE plpgsql
AS
$$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM reserved_schedule WHERE reserved_id = approve_id) THEN
		INSERT INTO reserved_schedule (reserved_id, reserved_start, reserved_end, subject_code, section, reserved_date, reserved_day, schedid, profid, roomid)
		VALUES (approve_id, vacant_start, vacant_end, subjectcode, reserve_date, reserve_day, reserve_section, schedid, profid, roomid);
	ELSE 
		RAISE NOTICE 'Reservation already exists';
	END IF;
	
	IF EXISTS(SELECT 1 FROM ccspace_reservation WHERE reservation_id = approve_id) THEN
		DELETE FROM ccspace_reservation WHERE reservation_id = approve_id;
	ELSE 
		RAISE NOTICE 'Reservation request does not exist';
	END IF;
END; 
$$;

*return reservation details*
CREATE OR REPLACE PROCEDURE getreservedscheduledetails(
    IN profid INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT *
    FROM reserved_schedule
    WHERE professor_id = profid;
END;
$$;

*RETURN WHOLE RESERVATIONS*
CREATE OR REPLACE PROCEDURE reservedscheduledetails()
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT *
    FROM reserved_schedule;
END;
$$;

