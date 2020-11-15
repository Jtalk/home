/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//

import "./header";
import "./owner-card";
import "./latest-posts";
import "./footer";

Cypress.Commands.add("containsTitle", (...segments) => {
  const textSegments = [...segments, "Cypress Bot"].join(" | ");
  cy.title().should("equal", textSegments);
});

Cypress.Commands.add("screenshotCI", (name) => {
  if (Cypress.env("CI")) {
    cy.screenshot(name);
  }
});

Cypress.Commands.add("apiRoute", (methodOrObject, url, stub) => {
  if (typeof methodOrObject === "string") {
    return cy.route(methodOrObject, `${Cypress.env("API_PREFIX")}${url}`, stub);
  } else {
    return cy.route({ ...methodOrObject, url: `${Cypress.env("API_PREFIX")}${methodOrObject.url}` });
  }
});

Cypress.Commands.add("stubRoutesIndex", () => {
  cy.fixture("owner").as("ownerFx");
  cy.fixture("footer").as("footerFx");
  cy.fixture("latest-posts").as("latestPostsFx");

  cy.apiRoute("GET", "/owner", "@ownerFx");
  cy.apiRoute("GET", "/footer", "@footerFx");
  cy.apiRoute("GET", "/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");
});
