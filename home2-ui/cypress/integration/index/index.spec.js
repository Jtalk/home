/* eslint-disable no-undef */

describe("/", () => {
  beforeEach(() => {
    cy.server();

    cy.fixture("owner").as("ownerFx");
    cy.fixture("footer").as("footerFx");
    cy.fixture("latest-posts").as("latestPostsFx");

    cy.route("GET", "http://localhost:8090/owner", "@ownerFx");
    cy.route("GET", "http://localhost:8090/footer", "@footerFx");
    cy.route("GET", "http://localhost:8090/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");

    cy.visit("/");
  });

  it("should render the page", () => {
    cy.containsTitle("About");

    cy.get("main div[data-id=content] h1").should("be.visible").should("have.text", "The Great Bot");
    cy.get("main div[data-id=content] h1 + p")
      .should("be.visible")
      .should("have.text", "Cybot is a great testing stub");

    cy.containsOwnerCard();
    cy.containsLatestPosts(3);

    cy.containsHeader(false);
    cy.containsFooter();
  });
});
