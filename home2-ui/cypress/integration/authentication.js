/* eslint-disable no-undef */

import dayjs from "dayjs";

describe("login", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
  });
  it("should log in from the main page", () => {
    cy.visit("/");

    // Open & close the modal
    cy.get("[data-id=owner-card] [data-id=owner-name]").should("be.visible").click({ altKey: true });
    cy.get("[data-id=login-modal]")
      .should("be.visible")
      .within(() => {
        cy.get("[data-id=login-button]").should("be.disabled");
        cy.get("[data-id=cancel-button]").click();
      });
    cy.get("[data-id=login-modal]").should("not.be.visible");

    // Open again
    cy.get("[data-id=owner-card] [data-id=owner-name]").should("be.visible").click({ altKey: true });
    cy.get("[data-id=login-modal]")
      .should("be.visible")
      .within(() => {
        // Empty password
        cy.get("[data-id=login-input] input").type("admin");
        cy.get("[data-id=login-input] input").should("have.value", "admin");
        cy.get("[data-id=login-button]").click();
        cy.containsLoginError("password-input", "Empty password field");

        // Empty login
        cy.get("[data-id=login-input] input").clear();
        cy.get("[data-id=password-input] input").type("password");
        cy.get("[data-id=password-input] input").should("have.value", "password");
        cy.get("[data-id=login-button]").click();
        cy.containsLoginError("login-input", "Empty login field");

        // Cancel clears the inputs
        cy.get("[data-id=login-input] input").type("admin");
        cy.get("[data-id=cancel-button]").click();
      });
    cy.get("[data-id=login-modal]").should("not.be.visible");
    cy.get("[data-id=owner-card] [data-id=owner-name]").should("be.visible").click({ altKey: true });
    cy.get("[data-id=login-modal]")
      .should("be.visible")
      .within(() => {
        cy.get("[data-id=login-input] input").should("have.value", "");
        cy.get("[data-id=password-input] input").should("have.value", "");
        cy.get("[data-id=login-error]").should("not.be.visible");

        // Report login error from API
        cy.apiRoute({
          method: "POST",
          url: "/login",
          status: 400,
          response: {
            errors: ["Invalid login/password"],
          },
        }).as("loginFail");
        cy.get("[data-id=login-input] input").type("admin");
        cy.get("[data-id=password-input] input").type("password1");
        cy.get("[data-id=login-button]").click();
        cy.wait("@loginFail").its("requestBody").should("equal", "login=admin&password=password1");
      });
    // .click() detaches the old modal for some reason, invalidating the above `within`
    cy.get("[data-id=login-error] [data-id=header]").should("have.text", "Error");
    cy.get("[data-id=login-error] [data-id=message]").should("have.text", "Invalid login/password");

    // Successful login
    const expiry = dayjs().add(1, "hour").toISOString();
    cy.apiRoute("POST", "/login", { expiry }).as("loginSuccess");
    cy.get("[data-id=login-modal]")
      .should("be.visible")
      .within(() => {
        cy.get("[data-id=login-input] input").clear();
        cy.get("[data-id=password-input] input").clear();

        cy.get("[data-id=login-input] input").type("user");
        cy.get("[data-id=password-input] input").type("rightpass");
        cy.get("[data-id=login-button]").click();
        cy.wait("@loginSuccess").should(({ request }) => {
          expect(request.body).to.equal("login=user&password=rightpass");
          expect(request.headers).to.have.property("Content-Type", "application/x-www-form-urlencoded");
        });
      });
    cy.get("[data-id=login-modal]")
      .should("not.be.visible")
      .then(() => {
        expect(localStorage.getItem("session-username")).to.equal("user");
        expect(localStorage.getItem("session-expiry")).to.equal(expiry);
      });
    cy.get("[data-id=header-account-dropdown]").should("be.visible");
    cy.get("[data-id=owner-card] [data-id=owner-name]").should("be.visible").click({ altKey: true });
    cy.get("[data-id=login-modal]").should("not.be.visible");
  });
});
