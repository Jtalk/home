/* eslint-disable no-undef */

Cypress.Commands.add("containsFooter", () => {
  cy.get("footer p").should("be.visible").should("contain.text", "Copyright (C)");

  cy.get("footer div[data-id=footer-links-list] a")
    .eq(0)
    .should("have.attr", "href", "https://example.com")
    .should("have.text", "About");
  cy.get("footer div[data-id=footer-links-list] *").eq(1).should("have.text", " | ");
  cy.get("footer div[data-id=footer-links-list] a")
    .eq(1)
    .should("have.attr", "href", "https://github.com/Jtalk/home")
    .should("have.text", "Source");
  cy.get("footer div[data-id=footer-links-list] *").eq(3).should("have.text", " | ");
  cy.get("footer div[data-id=footer-links-list] a")
    .eq(2)
    .should("have.attr", "href", "http://example.com/else")
    .should("have.text", "Else");
  cy.get("footer div[data-id=footer-links-list] *").eq(5).should("not.exist");

  cy.get("footer a[data-id=footer-logo]").eq(0).should("have.attr", "href", "https://example.com");
  cy.get("footer a[data-id=footer-logo] img")
    .eq(0)
    .should("have.attr", "src", "/images/icon32.png")
    .should("have.attr", "alt", "Site Icon")
    .should("have.attr", "height", "40px");
  cy.get("footer a[data-id=footer-logo]").eq(1).should("have.attr", "href", "https://example.com/avatar");
  cy.get("footer a[data-id=footer-logo] img")
    .eq(1)
    .should("have.attr", "src", "/images/avatar.png")
    .should("have.attr", "alt", "Avatar Icon")
    .should("have.attr", "height", "40px");
});
