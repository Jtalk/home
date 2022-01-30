const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

module.exports = {
    /**
     * 
     * @param {mongodb.Db} db 
     * @param {mongodb.MongoClient} client 
     */
    async up(db, client) {
        const files = await db.collection('fs.files').find().toArray();
        for (const file of files) {
            const newId = new ObjectId();
            const newFile = { ...file, _id: newId, old_id: file._id };
            await db.collection('fs.files').insertOne(newFile);
            await db.collection('fs.chunks').updateMany({ files_id: file._id }, { $set: { files_id: newId } });
        }
    },

    /**
     * 
     * @param {mongodb.Db} db 
     * @param {mongodb.MongoClient} client 
     */
    async down(db, client) {
        const files = await db.collection('fs.files').find().toArray();
        for (const file of files) {
            if (!file.old_id) continue;

            await db.collection('fs.chunks').updateMany({ files_id: file._id }, { $set: { files_id: file.old_id } });
            await db.collection('fs.files').deleteOne({ _id: file._id });
        }
    }
};
