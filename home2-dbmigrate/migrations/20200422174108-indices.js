module.exports = {
  async up(db, client) {

    console.log("Creating unique indices");
    await db.collection("session").createIndex("id", {unique: true, name: "session.id"});
    await db.collection("articles").createIndex("id", {unique: true, name: "articles.id"});
    await db.collection("projects").createIndex("id", {unique: true, name: "projects.id"});
    await db.collection("authentication").createIndex("id", {unique: true, name: "authentication.id"});
    await db.collection("authentication").createIndex("login.login", {unique: true, name: "authentication.login"});

    console.log("Creating sort indices");
    await db.collection("articles").createIndex(["published", "created"], {name: "articles.published-created"});
    await db.collection("projects").createIndex(["published", "order"], {name: "projects.published-order"});
  },

  async down(db, client) {

    await db.collection("session").dropIndex("session.id");
    await db.collection("articles").dropIndex("articles.id");
    await db.collection("projects").dropIndex("projects.id");
    await db.collection("authentication").dropIndex("authentication.id");
    await db.collection("authentication").dropIndex("authentication.login");

    await db.collection("articles").dropIndex("articles.published-created");
    await db.collection("projects").dropIndex("projects.published-order");
  }
};
