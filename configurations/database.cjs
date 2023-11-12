const { Pool } = require('pg')

const pool = new Pool({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password:"$root",
        database: "ccspace",
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: false
    })

pool.on('connect', ()=>{
    console.log('Database connected')
})
pool.on('end', ()=>{
    console.log('Database disconnected')
})

module.exports = { pool }