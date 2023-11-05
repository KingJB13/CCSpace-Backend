const { Client } = require('pg')

const client = new Client({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password:"$root",
        database: "ccspace",
        
    })

client.on('connect', ()=>{
    console.log('Database connected')
})
client.on('end', ()=>{
    console.log('Database disconnected')
})
    
module.exports = { client }