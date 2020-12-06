/* eslint-disable no-undef */

describe("/", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
    cy.visit("/");
  });

  it("should render the page", () => {
    cy.containsTitle("About");

    cy.get("main div[data-id=owner-bio] h1").should("be.visible").should("have.text", "The Great Bot");
    cy.get("main div[data-id=owner-bio] h1 + p")
      .should("be.visible")
      .should("have.text", "Cybot is a great testing stub");

    cy.containsOwnerCard();
    cy.get("div[data-id=latest-posts]").should("be.visible");

    cy.containsHeader("About", false);
    cy.containsFooter();

    cy.screenshotsCI("index");
  });
});
