const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

module.exports = {
    /**
     * 
     * @param {mongodb.Db} db 
     * @param {mongodb.MongoClient} client 
     */
    async up(db, client) {
        await db.collection('fs.files').updateMany({}, { $rename: { "contentType": "metadata.contentType" } });
    },

    /**
     * 
     * @param {mongodb.Db} db 
     * @param {mongodb.MongoClient} client 
     */
    async down(db, client) {
        await db.collection('fs.files').updateMany({}, { $rename: { "metadata.contentType": "contentType" } });
    }
};
