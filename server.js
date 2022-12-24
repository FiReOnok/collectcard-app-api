const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs');

const port = 1337
const app = express()
const api = require('./routes/api')

app.use(cors())
app.use(bodyParser.json())

// Logger
app.use((req, res, next) => {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var utc = now.getTimezoneOffset() / 60 * (-1);
    var hour = now.getHours();
    var min = now.getMinutes();
    var sec = now.getSeconds();
    var reqIp = req.ip;
    if (reqIp.substr(0, 7) == '::ffff:') {
        reqIp = reqIp.substr(7);
    } else if (reqIp.substr(0, 3) == '::1') {
        reqIp = '127.0.0.1';
    }
    var data = `${year}-${month}-${day} | ${hour}:${min}:${sec} UTC+${utc} | ${req.method} ${req.url} from ${reqIp} | ${req.get('user-agent')}`;
    console.log(data);
    fs.appendFile('server.log', data + "\n", (err) => {
        if (err) {
            return console.log(`Ошибка записи лога: ${err}`)
        }
    });
    next();
})
app.use('/api', api)



app.get('/' , (req, res) => {
    res.send(`API is working on port ${port}`)
})

app.listen(port, (req, res) => {
    console.log(`API is working on port ${port}`)
})