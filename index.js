const express = require('express')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')

const adminRouter = require('./routers/admin/adminRoutes')
const leaveRouter = require('./routers/leave/leaveRoutes')
const regularEmployeeRouter = require('./routers/employee/regular/regularEmployeeRoutes')
const substituteEmployeeRouter = require('./routers/employee/substitute/substituteEmployeeRoutes')
const { errorHandler } = require('./middlewares/error/errorMiddleware')
const { connectDB } = require('./database/db')

const app = express()
const port = process.env.PORT
connectDB()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api/admin', adminRouter)
app.use('/api/leaves', leaveRouter)
app.use('/api/employee/regular', regularEmployeeRouter)
app.use('/api/employee/substitute', substituteEmployeeRouter)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`server runs on port ${port}`)
})