const express = require('express')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')

const adminRouter = require('./routers/admin/adminRoutes')
const leaveRouter = require('./routers/leave/leaveRoutes')
const employeeRouter = require('./routers/employee/employeeRoutes')
const { errorHandler } = require('./middlewares/error/errorMiddleware')
const { connectDB } = require('./database/db')

const app = express()
const port = process.env.PORT
connectDB()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api/admin', adminRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/employees', employeeRouter)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`server runs on port ${port}`)
})