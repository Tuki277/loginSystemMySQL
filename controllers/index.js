const e = require('express')
const data = require('../config/connect')
const redis = require('redis')
const { json } = require('body-parser')
const jwt = require('jsonwebtoken')

exports.getAccount = (req, res, next) => {
    res.render('login')
}

exports.loginAuthentication = (req, res, next) => {
    var account = req.body.account
    var password = req.body.password
    data.query('SELECT * FROM account WHERE account = ? AND password = ?', [account, password], (err, rows, fields) => {
        if (rows.length > 0) {
            res.send('LOGIN SUCCESS')
        } else {
            res.send('LOGIN FAIL')
        }
    })
}

exports.getLogin = (req, res, next) => {
    console.log(req.body)
    var username = req.body.username
    var password = req.body.password
    data.query('SELECT * FROM account WHERE account = ? AND password = ?', [username, password], (err, rows, fields) => {
        if (rows.length > 0) {

            const token = jwt.sign({ username: rows.username}, 'mk')

            //redis
            const client = redis.createClient(6379)
            const redisKey = 'account:password'
            client.setex(redisKey, 3600, JSON.stringify(rows))
            //===================================

            res.status(200).json({ data : "success",
                                   token : token
                })
        } else {
            // res.send('LOGIN FAIL')
            res.status(200).json({ data : "false" })
        }
    })
}

exports.register = (req, res, next) => {
    // var io = req.app.get('socketio')
    const dataInsert = [req.body.account, req.body.password]

        data.query('INSERT INTO account (account, password) VALUES (?, ?)', dataInsert, (err, rows, fields) => {
            if (err){
                console.log(err)
            }
            else {
                // res.status(201).json({ success: true })
                res.status(201).json({ data: dataInsert })
                req.app.io.emit('data', { message: 'success'} )
            }
        })
}

exports.getRegister = (req, res, next) => {
    res.render('register')
}

exports.getProfileById = (req, res, next) => {
    var id = req.params.id
    data.query('SELECT * FROM account WHERE id = ?', id, (err, rows, fields) => {
        if (err) {
            res.status(500).json({ err })
        } else {
            res.status(200).json({ data : rows })
        }
    })
}

exports.getAll = (req, res, next) => {
    data.query('SELECT * FROM account', (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data : rows })
        }
    })
}

exports.postData = (req, res, next) => {
    const dataInsert = [req.body.name, req.body.title, req.body.content, req.body.selectOptions_id]
    console.log(dataInsert)
    jwt.verify(req.token, 'mk', (err, authData) => {
        if (err) {
            res.status(403)
        } else {
            data.query('INSERT INTO notify (name, title, content, usersend) VALUES (?, ?, ?, ?)', dataInsert, (err, rows, fields) => {
                if (err){
                    res.status(200).json({ err })
                }
                else {
                    res.status(201).json({ success: true })
                    // res.status(201).json({ rows })
                    req.app.io.emit('data', { message: 'success' } )
                }
            })
        }
    })
}

exports.getData = (req, res, next) => {
    data.query('SELECT * FROM notify', (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data : rows })
        }
    })
}

exports.getUserStatus = (req, res, next) => {
    data.query('SELECT * FROM userstatus', (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data: rows })
        }
    })
}

exports.addUserStatus = (req, res, next) => {
    const dataInsert = [req.body.username, req.body.isActive]
    data.query('INSERT INTO userstatus (username, isActive) VALUE (?, ?)', dataInsert, (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(201).json({ success : true })
        }
    })
}

exports.getUserStatusById = (req, res, next) => {
    const id = req.params.id
    data.query('SELECT * FROM userstatus WHERE id = ?', id, (err, rows, fields) => {
        if ( err ) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data : rows })
        }
    })
}