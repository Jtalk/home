/* eslint-disable no-undef */

Cypress.Commands.add("containsOwnerCard", () => {
  cy.get("div[data-id=owner-card].ui.card")
    .should("be.visible")
    .within(() => {
      cy.get(" h3[data-id=owner-name].header").should("be.visible").should("have.text", "Cypress Bot");
      cy.get(" div[data-id=owner-nickname].meta").should("be.visible").should("have.text", "botocyp");
      cy.get(" div[data-id=owner-description].description")
        .should("be.visible")
        .should("have.text", "A good testing stub");
      cy.get(" span[data-id=owner-email]").should("be.visible").should("have.text", "botocyp@example.com");
    });
});
