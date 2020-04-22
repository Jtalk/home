module.exports = {
  async up(db, client) {
    console.log('Creating owner');
    await db.collection("owner").insertOne({
      name: 'Master',
      nickname: '',
      description: '',
      photoId: '',
      bio: '',
      contacts: {
      }
    });

    console.log('Creating footer');
    await db.collection("footer").insertOne({
      links: [],
      logos: []
    });
  },

  async down(db, client) {
    console.log("Dropping collections");
    await db.collection("owner").drop();
    await db.collection("footer").drop();
    await db.collection("projects").drop();
    await db.collection("articles").drop();
  }
};
