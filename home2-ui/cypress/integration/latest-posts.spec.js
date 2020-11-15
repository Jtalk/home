/* eslint-disable no-undef */

describe("/", () => {
  beforeEach(() => {
    cy.server();

    cy.fixture("owner").as("ownerFx");
    cy.fixture("footer").as("footerFx");

    cy.route("GET", "http://localhost:8090/owner", "@ownerFx");
    cy.route("GET", "http://localhost:8090/footer", "@footerFx");
  });
  it("should render full latest posts list", () => {
    cy.fixture("latest-posts").as("latestPostsFx");
    cy.route("GET", "http://localhost:8090/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");

    cy.visit("/");

    cy.containsLatestPosts(3);
  });
  it("should render limited number of items when no more available", () => {
    cy.fixture("latest-posts-1").as("latestPostsFx");
    cy.route("GET", "http://localhost:8090/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");

    cy.visit("/");

    cy.containsLatestPosts(1);
  });
  it("should render nothing when no posts are available", () => {
    cy.fixture("latest-posts-empty").as("latestPostsFx");
    cy.route("GET", "http://localhost:8090/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");

    cy.visit("/");

    cy.get("div[data-id=latest-posts]").should("not.be.visible");
  });
});
