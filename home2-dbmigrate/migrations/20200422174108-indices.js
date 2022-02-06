const mongodb = require("mongodb");

module.exports = {
  /**
   * 
   * @param {mongodb.Db} db 
   * @param {mongodb.MongoClient} client 
   */
  async up(db, client) {

    console.log("Dropping old indices");
    await db.collection("articles").dropIndex("id_1");
    await db.collection("projects").dropIndex("id_1");


    console.log("Creating unique indices");
    await db.collection("session").createIndex("id", {unique: true, name: "session.id"});
    await db.collection("articles").createIndex("id", {unique: true, name: "articles.id"});
    await db.collection("projects").createIndex("id", {unique: true, name: "projects.id"});
    await db.collection("authentication").createIndex("id", {unique: true, name: "authentication.id"});
    await db.collection("authentication").createIndex("login.login", {unique: true, name: "authentication.login"});

    console.log("Creating sort indices");
    await db.collection("articles").createIndex({ published: 1, created: 1 }, {name: "articles.published-created"});
    await db.collection("projects").createIndex({ published: 1, order: 1 }, {name: "projects.published-order"});
  },

  async down(db, client) {

    await db.collection("articles").createIndex({id: 1}, {unique: true});
    await db.collection("projects").createIndex({id: 1}, {unique: true});

    await db.collection("session").dropIndex("session.id");
    await db.collection("articles").dropIndex("articles.id");
    await db.collection("projects").dropIndex("projects.id");
    await db.collection("authentication").dropIndex("authentication.id");
    await db.collection("authentication").dropIndex("authentication.login");

    await db.collection("articles").dropIndex("articles.published-created");
    await db.collection("projects").dropIndex("projects.published-order");
  }
};
