module.exports = {
  async up(db, client) {

    console.log("Creating unique indices");
    await db.collection("session").createIndex("session.id", "id", {unique: true});
    await db.collection("articles").createIndex("articles.id", "id", {unique: true});
    await db.collection("projects").createIndex("projects.id", "id", {unique: true});
    await db.collection("authentication").createIndex("authentication.id", "id", {unique: true});
    await db.collection("authentication").createIndex("authentication.login", "login.login", {unique: true});

    console.log("Creating sort indices");
    await db.collection("articles").createIndex("articles.published-created", ["published", "created"]);
    await db.collection("projects").createIndex("projects.published-order", ["published", "order"]);
  },

  async down(db, client) {

    await db.collection("session").deleteIndex("session.id");
    await db.collection("articles").deleteIndex("articles.id");
    await db.collection("projects").deleteIndex("projects.id");
    await db.collection("authentication").deleteIndex("authentication.id");
    await db.collection("authentication").deleteIndex("authentication.login");

    await db.collection("articles").deleteIndex("articles.published-created");
    await db.collection("projects").deleteIndex("projects.published-order");
  }
};
