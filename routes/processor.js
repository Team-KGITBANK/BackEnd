const JSONdb = require('simple-json-db')
const db = new JSONdb('./config/storage.json')
const processorDB = new JSONdb('./config/processor.json')
const uuid = require('uuid')
const express = require('express')
const router = express.Router()
const config = require('../config/global.json')

router.get('/', (req, res) => {
    const { id, authToken } = req.body
    if(!checkAuthToken(authToken, id)) return res.json({ "status": 400 })
    res.json(processorDB.JSON())
})

router.post('/', (req, res) => {
    const { id, authToken, processorId, amount } = req.body
    if(!checkAuthToken(authToken, id)) return res.json({ "status": 400 })
    if(!id || !processorId || !amount) {
        return res.json({ "status": 400 })
    }
    if(!processorDB.has(processorId)) {
        return res.json({ "status": 401 })
    }
    const processor = processorDB.get(processorId)
    if((amount < processor.minimumInKg) || (amount > processor.maximumInKg)) {
        return res.json({ "status": 402 })
    }
    let data = db.get(id)
    data.customerContractInfo.push({
        "bizInfo": {
            "id": processorId,
            "name": processor.name,
        },
        "amount": amount,
        "status": "pending"
    })
    db.set(id, data)
    let bizData = db.get(processor.companyId)
    bizData.bizContractInfo.push({
        "customerInfo": {
            "id": id,
            "name": db.get(id).name,
        },
        "amount": amount,
        "status": "pending"
    })
    res.json({ "status": 200 })
})
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