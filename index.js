const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const app = express()


app.use(cors())
app.use('/api/leave', )
app.use('/api/employee', )

app.listen(6000, () => {
    console.log(`server runs on port 6000`)
})