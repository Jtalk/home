module.exports = {
    async up(db, client) {
        await db.collection('owner').updateMany({}, { $set: { id: "owner" } });
        await db.collection('footer').updateMany({}, { $set: { id: "footer" } });
    },

    async down(db, client) {
    }
};
