require('dotenv').config()
const express = require('express')
const app = express()
const api = require('./routes/api')
const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
  console.log(req.ip);
  console.log(req.get('X-Forwarded-For'));
  if (req.ip.includes('127.0.0.1') || (req.get('X-Forwarded-For').includes('129.16'))) {
    next()
  } else {
    res.sendStatus(403)
  }
})

app.use('/api', api)
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`);
})