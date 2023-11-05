// Import necessary modules and components
import app from './server.js';
import { client } from './database.cjs';

// Define the port for the server
const port = process.env.PORT || 5000
client.connect()

client.query(`SELECT * FROM ccspace_room`, (err,res) =>{
    if (!err){
        console.log(res.rows)
    }
    client.end()
})
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});