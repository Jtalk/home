let {v4: uuid} = require("uuid");
module.exports = {
    async up(db, client) {
        await db.collection('owner').updateMany({}, {$set: {updated: "2020-05-01T12:00:00Z", atomId: uuid()}});
        let articles = await db.collection('articles').find().toArray();
        articles.forEach(a => {
            a.updated = a.created;
            a.atomId = uuid()
            db.collection('articles').update({_id: a._id}, a);
        })
    },

    async down(db, client) {
        await db.collection('owner').updateMany({}, {$unset: {updated: "", atomId: ""}});
        await db.collection('articles').updateMany({}, {$unset: {updated: "", atomId: ""}});
    }
};
