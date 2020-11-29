/* eslint-disable no-undef */

Cypress.Commands.add("containsLoginError", (inputDataId, inputErrorText, errorText) => {
  cy.get("[data-id=login-error]").should("be.visible");
  cy.get("[data-id=login-error] [data-id=header]").should("have.text", "Error");
  errorText && cy.get("[data-id=login-error] [data-id=message]").should("have.text", errorText);
  cy.get(`.error [data-id=${inputDataId}]`).should("exist");
  cy.get(`.error [data-id=${inputDataId}] + [role=alert]`).should("have.text", inputErrorText);
});
