// Import necessary modules and components
import app from './server.js';
import { pool } from './database.cjs';

// Define the port for the server
const port = process.env.PORT || 5000

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down gracefully.')
  
    // Close the server
    server.close()
  
    // Close the database pool
    await pool.end()
  
    console.log('Server and database pool are closed. Exiting process.')
    process.exit(0);
  })