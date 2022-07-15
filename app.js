const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const sequelize = require('sequelize');

const authRouter = require('./routes/auth')
const disposerRouter = require('./routes/disposer')
const processorRouter = require('./routes/processor')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/auth', authRouter)
app.use('/disposer', disposerRouter)
app.use('/processor', processorRouter)

module.exports = app