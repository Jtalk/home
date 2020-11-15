/* eslint-disable no-undef */

Cypress.Commands.add("containsHeader", (authenticated) => {
  cy.get("div[data-id=header]").should("be.visible");
  cy.get("div[data-id=header] div[data-id=header-owner-info] img").should("have.attr", "src", "/images/icon16.png");
  cy.get("div[data-id=header] div[data-id=header-owner-info]").should("contain.text", "Cypress Bot");

  cy.get("div[data-id=header] a[data-id=header-about]")
    .should("have.attr", "href", "/")
    .should("have.text", "About")
    .should("have.class", "active");
  cy.get("div[data-id=header] a[data-id=header-projects]")
    .should("have.attr", "href", "/projects")
    .should("have.text", "Projects")
    .should("not.have.class", "active");
  cy.get("div[data-id=header] a[data-id=header-blog]")
    .should("have.attr", "href", "/blog/articles")
    .should("have.text", "Blog")
    .should("not.have.class", "active");

  cy.get("div[data-id=header] div[data-id=header-search-bar]").should("be.visible").should("have.class", "search");

  if (authenticated) {
    // todo
  } else {
    cy.get("div[data-id=header] a[data-id=header-admin-dropdown]").should("not.be.visible");
    cy.get("div[data-id=header] a[data-id=header-account-dropdown]").should("not.be.visible");
  }
});
