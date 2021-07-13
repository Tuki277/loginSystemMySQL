var mysql = require('mysql')

const connect = mysql.createConnection ({
    host : 'btafswnvrgvg5w36jdyp-mysql.services.clever-cloud.com',
    user : 'usobgfarxiif13wo',
    port : 3306,
    password : 'YR2sFyHrGXEHoQnPD1Gq',
    database : 'btafswnvrgvg5w36jdyp'
})

connect.connect((err) => {
    if (err){
        console.log('database connect fail')
    }
    else {
        console.log('database has connected')
    }
})

module.exports = connect