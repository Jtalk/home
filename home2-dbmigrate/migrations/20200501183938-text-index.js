module.exports = {
  async up(db, client) {

    console.log("Creating search indices");
    await db.collection("owner").createIndex({
      name: "text",
      nickname: "text",
      description: "text",
      bio: "text",
      contacts: "text",
    }, {
      name: "owner.search", 
      weights: {
        name: 2,
        nickname: 2
      }
    });
    await db.collection("articles").createIndex({
      title: "text",
      id: "text",
      content: "text",
      tags: "text"
    }, {
      name: "articles.search", 
      weights: {
        title: 3,
        id: 2
      }
    });
    await db.collection("projects").createIndex({
      title: "text",
      id: "text",
      description: "text",
      links: "text"
    }, {
      name: "projects.search", 
      weights: {
        title: 3,
        id: 2
      }
    });
  },

  async down(db, client) {

    await db.collection("owner").dropIndex("owner.search");
    await db.collection("articles").dropIndex("articles.search");
    await db.collection("projects").dropIndex("projects.search");
  }
};
