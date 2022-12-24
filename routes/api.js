const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const db = require('../config/db')
const path = require('path')
const multer = require('multer')

const User = require('../models/user')
const Card = require('../models/card')
const Collection = require('../models/collection')

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
const secretKey = 'pKFCexPViCcseFCf'

db.connect((err) => {
    if (err) {
        throw err.stack;
        return;
    }
    console.log('MySQL connected successfuly...')
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Saving images //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const storage = multer.diskStorage({
    destination: '../ngApp/src/assets/img/cards',
    filename: function (req, file, cb) {
        // console.log('two ' + Date.now())
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('card');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Middlewares ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, secretKey)
    if (!payload) {
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

router.get('/', (req, res) => {
    res.send('API loaded!')
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Users //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

router.post('/login', (req, res) => {
    let userData = req.body
    User.findUser(userData, (err, findedUser) => {
        if (err) {
            console.error(err);
        } else {
            // console.log(findedUser);
            // findedUser = JSON.stringify(findedUser);
            if (findedUser[0] == undefined) {
                res.status(401).send('Invalid email.')
            } else if (!bcrypt.compareSync(userData.pass, findedUser[0].pass)) {
                res.status(401).send('Invalid password.')
            } else {
                let payload = { subject: findedUser[0].id }
                let userId = `${findedUser[0].id}`;
                let token = jwt.sign(payload, secretKey)
                res.status(200).send({ token, userId });
            }
        }
    })
})

router.post('/register', (req, res) => {
    let userData = req.body;
    userData.pass = bcrypt.hashSync(userData.pass, saltRounds)
    console.log(userData);
    User.addUser(userData, (err) => {
        if (err) {
            console.log(`Error when register user: ${err}`)
        } else {
            let payload = { subject: userData }
            let token = jwt.sign(payload, secretKey)
            res.status(200).send({ token })
        }
    });
});

router.get('/users', (req, res) => {
    User.getAllUsers((error, rows) => {
        if (error) {
            res.send('Users not exists.')
        } else {
            res.json(rows)
        }
    });
});

router.get('/users/:id', (req, res) => {
    User.getUser(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Didn't found user with id ${req.params.id}`)
            res.send('User does not exists.')
        } else {
            res.json(rows)
        }
    });
});
router.get('/users/:id/collections', (req, res) => {
    User.getUserCollections(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Didn't found user with id ${req.params.id}`)
            res.send('User does not exists.')
        } else {
            res.json(rows)
        }
    });
});
router.post('/users/:id/collections', (req, res) => {
    // console.log('Обновнение старой коллекции');
    userCollection = req.body;
    User.updateUserCollection(userCollection, (err, rows) => {
        if (err) {
            console.log(`Didn't found user with id ${req.params.id}`)
            res.send('User does not exists.')
        } else {
            res.json(rows)
        }
    });
});
router.post('/users/:id/collections/new', (req, res) => {
    // console.log('Добавление коллекции');
    newUserCollection = req.body;
    User.addUserCollection(newUserCollection, (err, rows) => {
        if (err) {
            console.log(`Didn't found user with id ${req.params.id}`)
            res.send('User does not exists.')
        } else {
            res.json(rows)
        }
    });
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Cards //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

router.get('/cards', (req, res) => { // Получение списка всех карточек
    Card.getAllCards((err, rows) => {
        if (err) {
            console.log(`Error when getting cards list: ${err}`)
        }
        // console.log("Cards requested")
        res.json(rows)
    })
})
router.get('/cards/get', (req, res) => { // Получение случайной карточки из базы
    let getCards;
    min = 1;
    Card.getAllCards((err, rows) => {
        if (err) {
            console.log(`Error when getting cards list: ${err}`)
        }
        // console.log("Cards requested")
        getCards = rows
        randCard = Math.floor(Math.random() * (getCards.length - min + 1)) + min
        Card.getCard(randCard, (err, rows) => {
            if (err) {
                console.log(`Error when getting cards list: ${err}`)
            }
            // console.log("Cards requested")
            res.json(rows)
        })
    })
})
router.post('/cards', verifyToken, (req, res) => {
    let newCard = req.body;
    console.log(newCard[5])
    Card.addCard(newCard, (err, rows) => {
        if (err) {
            console.log(`Error when creating Card: ${err}`)
        }
        // console.log("Collections requested")
        res.json(rows)
    })
})
router.post('/uploadImg', (req, res) => {
    // console.log('one ' + Date.now())
    upload(req, res, (err) => {
        if (err) {
            res.json({
                msg: `Error when uploading image: ${err}`
            });
        } else if (req.file == undefined) {
            res.json({
                msg: 'Error: No File Selected!'
            });
        } else {
            res.json(`${req.file.filename}`);
        }
    });
})
router.get('/cards/:id', (req, res) => { // Получение карточки по ID
    Card.getCard(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Error when getting cards list: ${err}`)
        }
        // console.log("Cards requested")
        res.json(rows)
    })
})
router.get('/cards/:id/add', (req, res) => { // Увеличение общего числа карточек
    Card.getCard(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Error when increasing card count: ${err}`)
        }
        newCount = rows[0].count + 1
        // console.log(newCount)
        Card.increaseCard(req.params.id, newCount, (err, rows) => {
            if (err) {
                console.log(`Error when increasing card count: ${err}`)
            }
            res.status(200).json(rows)
        })
        // console.log("Cards requested")
    })
})
router.get('/cards/collections/:id', (req, response) => {
    Card.getCardsInCollection(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Error when getting collection cards list: ${err}`)
        }
        // console.log("Cards requested")
        response.json(rows)
    })
})


////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Collections //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

router.get('/collections', verifyToken, (req, res) => {
    Collection.getAllCollections((err, rows) => {
        if (err) {
            console.log(`Error when getting collections list: ${err}`)
        }
        // console.log("Collections requested")
        res.json(rows)
        // console.log(rows)
    })
})
router.post('/collections', verifyToken, (req, res) => {
    let newCollection = req.body;
    Collection.addCollection(newCollection, (err, rows) => {
        if (err) {
            console.log(`Error when creating collection: ${err}`)
        }
        // console.log("Collections requested")
        res.json(rows)
    })
})
router.get('/collections/:id', verifyToken, (req, res) => {
    Collection.getCollection(req.params.id, (err, rows) => {
        if (err) {
            console.log(`Error when getting collections list: ${err}`)
        }
        // console.log(`Collection id${req.params.id} requested`)
        res.json(rows)
    })
})

module.exports = router