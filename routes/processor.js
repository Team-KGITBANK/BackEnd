const JSONdb = require('simple-json-db')
const db = new JSONdb('./config/storage.json')
const uuid = require('uuid')
const express = require('express')
const router = express.Router()
const config = require('../config/global.json')

module.exports = router