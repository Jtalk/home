module.exports = {
  async up(db, client) {
    console.log('Creating owner');
    db.collection("owner").insertOne({
      name: 'Master',
      nickname: '',
      description: '',
      photoId: '',
      bio: '',
      contacts: {
      }
    });

    console.log('Creating footer');
    db.collection("footer").insertOne({
      links: [],
      logos: []
    });

    console.log('Creating indices');
    db.collection("projects").createIndex({id: 1}, {unique: true});
    db.collection("articles").createIndex({id: 1}, {unique: true});
  },

  async down(db, client) {
    console.log("Dropping collections");
    db.collection("owner").drop();
    db.collection("footer").drop();
    db.collection("projects").drop();
    db.collection("articles").drop();
  }
};
