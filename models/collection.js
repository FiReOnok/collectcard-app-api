const db = require('../config/db')
let Collection = {
    getAllCollections:function(callback){
        return db.query("SELECT * FROM collections", callback)
    },
    getCollection:function(id,callback){
        return db.query("SELECT * FROM collections WHERE id=?",[id],callback)
    },
    addCollection:function(collection,callback){
        return db.query("INSERT into collections (title, description, cardsCount, author_id, image_url) values(?,?,?,?,?)",[collection.title, collection.description, collection.cardsCount, collection.author_id, collection.image_url],callback)
    }
}
module.exports = Collection