const JSONdb = require('simple-json-db')
const db = new JSONdb('./config/storage.json')
const crypto = require('crypto')
const uuid = require('uuid')
const express = require('express');
const router = express.Router();
const config = require('../config/global.json')


router.post('/new', function(req, res, next) {
  const { id, password, firstName, lastName, mail, contactPhone, accountType,
    companyRegisterationNo, minimumWasteAmountInKg, maximumWasteAmountInKg, smallWasteUnitPricePerTon,
    mediumWasteUnitPricePerTon, largeWasteUnitPricePerTon, wasteDeliverTypesAvailable } = req.body
  if(!id || !password || !firstName || !lastName) {
    res.json({ "status": 400 })
    return
  }
  if(!mail) {
    res.json({ "status": 400 })
    return
  }
  if(accountType !== 0 && accountType !== 1) {
    res.json({ "status": 4022 })
  }
  if(accountType) {
    if(!company || !contactPhone || !companyRegisterationNo || !minimumWasteAmountInKg || !maximumWasteAmountInKg || !smallWasteUnitPricePerTon || !mediumWasteUnitPricePerTon || !largeWasteUnitPricePerTon || !wasteDeliverTypesAvailable) {
      res.json({ "status": 400 })
      return
    }
  }
  if(db.has(id)) {
    res.json({ "status": 401 })
    return
  }
  const uniqueIdentifier = uuid.v4()
  const recoveryKey = uuid.v4()
  const authToken = uuid.v4()
  const date = new Date()
  const authTokenExpires = date.setDate(date.getDate() + 7)

  const hashedPassword = crypto.createHash('sha384').update(uniqueIdentifier + password, 'utf-8').digest('hex')

  const databaseBuilder = {
    "id": id,
    "authToken": authToken,
    "authTokenExpires": authTokenExpires,
    "firstName": firstName,
    "lastName": lastName,
    "mail": mail,
    "contactPhone": contactPhone !== undefined ? contactPhone : "",
    "uniqueIdentifier": uniqueIdentifier,
    "recoveryKey": recoveryKey,
    "hashedPassword": hashedPassword,
    "companyRegisterationNo": companyRegisterationNo !== undefined ? companyRegisterationNo : "",
    "minimumWasteAmountInKg": minimumWasteAmountInKg !== undefined ? minimumWasteAmountInKg : "",
    "maximumWasteAmountInKg": maximumWasteAmountInKg !== undefined ? maximumWasteAmountInKg : "",
    "smallWasteUnitPricePerTon": smallWasteUnitPricePerTon !== undefined ? smallWasteUnitPricePerTon : "",
    "mediumWasteUnitPricePerTon": mediumWasteUnitPricePerTon !== undefined ? mediumWasteUnitPricePerTon : "",
    "largeWasteUnitPricePerTon": largeWasteUnitPricePerTon !== undefined ? largeWasteUnitPricePerTon : "",
    "wasteDeliverTypesAvailable": wasteDeliverTypesAvailable !== undefined ? wasteDeliverTypesAvailable : "",
    "customerContractInfo": [],
    "bizContractInfo": []
  }
  const successMessageBuilder = {
    "status": 200,
    "data": {
      "authToken": authToken,
      "authTokenExpires": authTokenExpires,
      "recoveryKey": recoveryKey
    }
  }
  db.set(id, databaseBuilder)

  res.json(successMessageBuilder)
})

router.post('/login', (req, res) => {
  const { id, password } = req.body
  if(!id || !password) {
    res.json({ "status": 400 })
    return
  }
  if(!db.has(id)) {
    res.json({ "status": 401 })
  }
  if(!(id && password)) {
    res.json({ "status": 400 })
    return
  }
  if(!db.has(id)) {
    res.json({ "status": 401 })
    return
  }
  let data = db.get(id)
  const hashedPassword = crypto.createHash('sha384').update(data.uniqueIdentifier + password, 'utf-8').digest('hex')

  if((hashedPassword != data.hashedPassword) && (password != data.recoveryKey)) {
    res.json({ "status": 402 })
    return
  }

  const authToken = uuid.v4()
  const date = new Date()
  const authTokenExpires = date.setDate(date.getDate() + 7)

  data.authToken = authToken
  data.authTokenExpires = authTokenExpires

  const successMessageBuilder = {
    "status": 200,
    "data": {
      "authToken": authToken,
      "authTokenExpires": authTokenExpires
    }
  }
  db.set(id, data)
  res.json(successMessageBuilder)
})

router.delete('/logout', (req, res) => {
  const id = req.body.id
  const authToken = req.headers.authorization
  let data = db.get(id)
  if(checkAuthToken(authToken, id)) {
    data.authToken = ""
    data.authTokenExpires = ""

    db.set(id, data)
  } else {
    res.json({ "status": 400 })
    return
  }

})
router.get('/list', (req, res) => {
    const authToken = req.headers.authorization
    const id = req.query.id
    if(!checkAuthToken(authToken, id)) {
        res.json({ "status": 400 })
        return
    }
    let data = db.get(id)
    data.uniqueIdentifier = ":redacted:"
    data.hashedPassword = ":redacted:"
    res.json(data)
})

router.post('/edit', (req, res) => {
  const { id, authToken, firstName, lastName, mail, contactPhone, accountType,
    companyRegisterationNo, minimumWasteAmountInKg, maximumWasteAmountInKg, smallWasteUnitPricePerTon,
    mediumWasteUnitPricePerTon, largeWasteUnitPricePerTon, wasteDeliverTypesAvailable } = req.body

  if(checkAuthToken(authToken, id)) {
    let data = db.get(id)
    if(firstName) {
      data.firstName = firstName
    }
    if(lastName) {
      data.lastName = lastName
    }
    if(mail) {
      data.mail = mail
    }
    if(contactPhone) {
      data.contactPhone = contactPhone
    }
    if(companyRegisterationNo) {
      data.companyRegisterationNo = companyRegisterationNo
    }
    if(minimumWasteAmountInKg) {
      data.minimumWasteAmountInKg = minimumWasteAmountInKg
    }
    if(maximumWasteAmountInKg) {
      data.maximumWasteAmountInKg = maximumWasteAmountInKg
    }
    if(smallWasteUnitPricePerTon) {
      data.smallWasteUnitPricePerTon = smallWasteUnitPricePerTon
    }
    if(mediumWasteUnitPricePerTon) {
      data.mediumWasteUnitPricePerTon = mediumWasteUnitPricePerTon
    }
    if(largeWasteUnitPricePerTon) {
      data.largeWasteUnitPricePerTon = largeWasteUnitPricePerTon
    }
    if(wasteDeliverTypesAvailable) {
      data.wasteDeliverTypesAvailable = wasteDeliverTypesAvailable
    }
    db.set(id, data)
    res.json({ "status": 200 })
    return true
  } else {
    res.json({ "status": 400 })
    return
  }
})
/*
  Checks if Authorization Token is valid
  token, id: string

  return: boolean
 */
function checkAuthToken(token, id) {
  if(!token || !id) {
    return false
  }
  if(!db.has(id)) {
    return false
  }
  if(db.get(id).authToken != token) {
    return false
  }
  return true
}
module.exports = router