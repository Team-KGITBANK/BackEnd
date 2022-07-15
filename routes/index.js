const crypto = require('crypto')
const uuid = require('uuid')
const redis = require('redis')
const express = require('express');
const router = express.Router();
const config = require('config/global.json')

const redisClient = redis.createClient({

})
router.post('/new', function(req, res, next) {
  const id = req.body.id
  const password = req.body.password
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const contactPhone = req.body.contactPhone !== undefined ? req.body.contactPhone : ""

  if(!((id && password) && (firstName & lastName))) {
    res.json({ "status": 400 })
    return
  }
  if(isUserExists(id)) {
    res.json({ "status": 401 })
    return
  }
  const uniqueIdentifier = uuid.v4()
  const recoveryKey = uuid.v4()
  const authToken = uuid.v4()
  const date = new Date()
  const authTokenExpires = date.setDate(date.getDate() + 7)

  const hashedPassword = crypto.createHash('sha384').update(uniqueIdentifier + password, 'utf-8').digest('hex')

  const messageBuilder = {
    "id": id,
    "authToken": authToken,
    "authTokenExpires": authTokenExpires,
    "password": password,
    "firstName": firstName,
    "lastName": lastName,
    "contactPhone": contactPhone,
    "uniqueIdentifier": uniqueIdentifier,
    "recoveryKey": recoveryKey,
    "hashedPassword": hashedPassword
  }
})

router.post('/signin', (req, res) => {
  const id = req.body.id
  const password = req.body.password
  const uniqueIdentifier = "get-this-from-DB"
  const hashedPassword = crypto.createHash('sha384').update(uniqueIdentifier + password, 'utf-8').digest('hex')

  if(!(id && password)) {
    res.json({ "status": 400 })
    return
  }
  if(!isUserExists(id)) {
    res.json({ "status": 401 })
    return
  }
  if((hashedPassword != db.hashedPassword) && (password == db.recoveryKey)) {
    res.json({ "status": 402 })
    return
  }

  const authToken = uuid.v4()
  const date = new Date()
  const authTokenExpires = date.setDate(date.getDate() + 7)

  db.authToken = authToken
  db.authTokenExpires = authTokenExpires
  db.date = date

})

router.delete('/logout', (req, res) => {
  const id = req.body.id
  const authToken = req.body.authToken
  if(!(id && authToken)) {
    res.json({ "status": 400 })
    return
  }
  if(db.authToken != authToken) {
    res.json({ "status": 401 })
    return
  }
  db.authToken

})

/*
  Checks if User Exists in Redis Database
  id: string

  return: boolean
 */
function isUserExists(id) {
  return id
}
module.exports = router;
