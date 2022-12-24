const db = require('../config/db')
let Card = {
    getCard:function(id, callback){
        return db.query("SELECT * FROM cards where id=?",[id], callback)
    },
    getAllCards:function(callback){
        return db.query("SELECT * FROM cards", callback)
    },
    getCardsInCollection:function(collId, callback){
        return db.query("SELECT * FROM cards WHERE collection_id=?",[collId], callback)
    },
    addCard:function(card, callback){
        return db.query("INSERT into cards (collection_id, name, description, count, rareness, image_url) values(?,?,?,?,?,?);",[card.collection_id, card.name, card.description, card.count, card.rareness, card.image_url],callback)
    },
    increaseCard:function(id, newCount, callback){
        return db.query("UPDATE cards SET count=? WHERE id=?",[newCount, id], callback)
    }
}
module.exports = Card