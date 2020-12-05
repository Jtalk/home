/* eslint-disable no-undef */
Cypress.Commands.add("verifyInputAndEdit", (selector, expectedValue, newValue) => {
  cy.get(selector).should("have.value", expectedValue).clear().type(newValue).should("have.value", newValue);
});
