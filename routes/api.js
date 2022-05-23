require('dotenv').config()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
const folioCommunicator = require('../folio/foliocommunicator')

const okapiUrl = process.env.OKAPIURL
const okapiUser = process.env.OKAPIUSER
const okapiPwd = process.env.OKAPIPWD
const okapiTenant = process.env.OKAPITENANT
const jwtSecret = process.env.JWTSECRET
const users = JSON.parse(process.env.USERS)
const deniedGroups = process.env.DENIEDGROUPS

let folio = new folioCommunicator(okapiUrl, okapiUser, okapiPwd, okapiTenant)

router.use(bodyParser.json())

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['authorization']
  if(!token) {
    return res.status(403).send('A token is required')
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], jwtSecret)
    req.user = decoded
  } catch (error) {
    console.log(error.message);
  }
  return next()
}

router.post('/session/login', (req, res) => {
  try {
    const { username, password } = req.body

    if(!(username && password)) {
      res.status(400).send(`Missing parameters, ${req.body.username}, ${req.body.password}`)
    }

    if( username in users && users[username]==password) {
      let user = {username}
      const token = jwt.sign({user}, jwtSecret, {expiresIn: '2h'})
      user.token = token
      res.status(200).json(user)
    } else {
      res.status(400).send('Invalid credentials')
    }
  } catch (error) {
    console.log(error.message);
  }
})

router.get('/session/user', verifyToken, (req, res) => {
  let user = req.user
  res.json(user)
})

router.get('/user/:barcode', verifyToken, async (req,res) => {
  let barcode = req.params.barcode
  try {
    let user = await folio.getUserWithBarcode(barcode)
    user.pwdReset = deniedGroups.includes(user.patronGroup)?false:true
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get('/getPagingSlips', verifyToken, async (req, res) => {
  try {
    let slips = await folio.getPagingSlips();
    res.json(slips)
  } catch (error) {
    console.log(error.message);
  }
})

router.get('/getServicePoints', verifyToken, async (req, res) => {
  try {
    let sp = await folio.getServicePointsWithHoldShelf()
    res.json(sp)
  } catch (error) {
    console.log(error.message);
  }
})

router.get('/getShelfList/:id', verifyToken, async (req, res) => {
  const id = req.params.id
  try {
    let shelfList = await folio.getShelfList(id)
    res.json(shelfList)
  } catch (error) {
    console.log(error.message);
  }
})

router.post('/user/changepin', verifyToken, async (req,res) => {
  let username = req.body.username
  let password = req.body.password

  try {
    const resp = await folio.updatePassword(username, password)
    res.send(resp)
  } catch (error) {
    console.log(error.message);
  }
  
})

module.exports = router
