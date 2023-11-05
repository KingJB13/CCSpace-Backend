import ccspace from "./route/ccspace.route.js"
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", ccspace)
app.use("*",(req, res) => res.status(404).json({error:"not found"}))

export default app