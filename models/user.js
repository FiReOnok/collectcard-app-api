const db = require('../config/db')
let User = {
    getAllUsers:function(callback){
        return db.query("SELECT * FROM user", callback)
    },
    getUser:function(id, callback){
        return db.query("SELECT * FROM user WHERE id=?",[id],callback)
    },
    getUserCollections:function(id, callback){
        return db.query("SELECT * FROM userCollections WHERE user_id=?",[id],callback)
    },
    addUserCollection:function(newCollection,callback){
        return db.query("INSERT into userCollections (user_id, collection_id, cards_id, count) values(?,?,?,?)",[newCollection.user_id, newCollection.collection_id, newCollection.cards_id, newCollection.count],callback)
    },
    updateUserCollection:function(updatedCollection, callback){
        return db.query("UPDATE userCollections SET count=? WHERE user_id=? AND cards_id=?",[updatedCollection.count, updatedCollection.user_id, updatedCollection.cards_id], callback)
    },
    findUser:function(user, callback){
        return db.query("SELECT * from user WHERE email=?",[user.email],callback)
    },
    addUser:function(user, callback){
        return db.query("INSERT into user (user, pass, email) values(?,?,?)",[user.login,user.pass,user.email],callback)
    },
    updateUser:function(user, callback){
        return db.query("UPDATE user SET pass=?, email=? WHERE id=?",[user.pass,user.email,user.id],callback)
    },
    deleteUser:function(id, callback){
        db.query("DELETE FROM user WHERE id=?",[id])
    }
}
module.exports = User