const e = require('express')
const data = require('../config/connect')
const redis = require('redis')
const { json } = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

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
    const username = req.body.username
    const password = req.body.password
    try {
        data.query('SELECT * FROM account WHERE account = ?', username, async (err, rows, fields) => {
            if (rows.length > 0) {
                console.log(rows[0].id)
                const token = jwt.sign({ username: username }, 'mk')
                for (let i = 0; i < rows.length; i++) {
                    console.log(rows[i].PASSWORD)
                    if (await bcrypt.compare(password, rows[i].PASSWORD)) {
                        res.status(200).json({ message: "Login success",
                                               token: token })
                    } else {
                        res.status(200).json({ message: "Password wrong" })
                    }
                }
            } else {
                res.status(200).json({ message: "Login fail" })
            }
        }
        )
    } catch (error) {
        console.log(error)
    }
    // const client = redis.createClient(6379)

    // return client.GET(username, (err, data) => {
    //     if (data) {
    //         console.log(JSON.parse(data).data)
    //         res.status(200).json({
    //             message : "success (get from redis)",
    //             token :JSON.parse(data).token,
    //             rows: JSON.parse(data).data
    //         })
    //     } else {
    //         //redis
    //         client.SET(username, JSON.stringify({
    //             data : rows,
    //             token
    //         }))
    //===================================
    // try {
    //     if (check) {
    //         res.status(200).json({ message : "success",
    //             token : token,
    //             rows
    //         })
    //     } else {
    //         res.status(200).json({ message : "Password wrong" })
    //     }
    // } catch (error) {
    //     console.log(error)
    // }
    // } else {
    //     res.status(200).json({ message: "Login fail" })
    // }
}

exports.register = async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        data.query('INSERT INTO account (account, password, role) VALUES (?, ?, ?)', [req.body.username, hashedPassword, req.body.role], (err, rows, fields) => {
            if (err) {
                console.log(err)
            }
            else {
                // res.status(201).json({ success: true })
                res.status(201).json({ message: "success" })
                req.app.io.emit('data', { message: 'success' })
            }
        })
    } catch (error) {
        console.log(error)
    }
    // var io = req.app.get('socketio')
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
            res.status(200).json({ data: rows })
        }
    })
}

exports.getAll = (req, res, next) => {
    data.query('SELECT * FROM account', (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data: rows })
        }
    })
}

exports.postData = (req, res, next) => {
    const dataInsert = [req.body.name, req.body.title, req.body.content, req.body.id_user]
    console.log('req.token ========= ', req.token)
    jwt.verify(req.token, 'mk', (err, authData) => { // protected router
        if (err) {
            res.status(403).json({ message: "NOT PERMISSION 1" })
        } else {
            data.query('INSERT INTO notify (name, title, content, id_user) VALUES (?, ?, ?, ?)', dataInsert, (err, rows, fields) => {
                if (err) {
                    res.status(401).json({ err })
                }
                else {
                    res.status(201).json({ success: true })
                    // res.status(201).json({ rows })
                    req.app.io.emit('data', { message: 'success' })
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
            res.status(200).json({ data: rows })
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
            res.status(201).json({ success: true })
        }
    })
}

exports.getUserStatusById = (req, res, next) => {
    const id = req.params.id
    data.query('SELECT * FROM userstatus WHERE id = ?', id, (err, rows, fields) => {
        if (err) {
            res.status(200).json({ err })
        } else {
            res.status(200).json({ data: rows })
        }
    })
}

exports.getNotiByUser = (req, res, next) => {
    const id = req.params.id
    jwt.verify(req.token, 'mk', (err, authData) => { // protected router
        if (err) {
            res.status(403).json({ err })
        } else {
            data.query('SELECT * FROM notify, account WHERE notify.id_user = ? AND notify.id_user = account.id', id, (err, rows, fields) => {
                if (err) {
                    res.status(500).json({ err })
                } else {
                    res.status(200).json({ data: rows })
                }
            })
        }
    })
}

exports.updateAccount = (req, res, next) => {
    var id = req.params.id
    var account = req.body.account
    var password = req.body.password
    var role = req.body.role
    const client = redis.createClient(6379)
    jwt.verify(req.token, 'mk', (err, authData) => {
        if (err) {
            res.status(403).json({ err })
        } else {
            data.query('UPDATE account SET account = ?, password = ?, role = ? WHERE id = ?', [account, password, role, id], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({ err })
                } else {
                    req.app.io.emit('update', {
                        message: 'updated',
                        id: id
                    })
                    // res.status(200).json({ data: rows })
                    return client.GET(req.body.account, (err, data) => {
                        res.status(200).json({
                            message: 'done',
                            token: JSON.parse(data).token,
                            rows: JSON.parse(data).data
                        })
                    })
                }
            })
        }
    })
}