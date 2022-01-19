require('dotenv').config()
const express = require('express')
const app = express()
const api = require('./routes/api')
const PORT = process.env.PORT || 3000

app.use('/api', api)
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`);
})