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

import dayjs from "dayjs";
import "./header";
import "./owner-card";
import "./latest-posts";
import "./footer";
import "./search";
import "./projects";
import "./blog";
import "./login";
import "./edit";

Cypress.Commands.add("containsTitle", (...segments) => {
  const textSegments = [...segments, "Cypress Bot"].join(" | ");
  cy.title().should("equal", textSegments);
});

Cypress.Commands.add("screenshotCI", (name) => {
  if (Cypress.env("CI")) {
    cy.screenshot(name);
  }
});

Cypress.Commands.add("screenshotsCI", (title) => {
  cy.viewport("iphone-5", "portrait");
  cy.screenshotCI(`${title} (small mobile)`);

  cy.viewport("iphone-5", "landscape");
  cy.screenshotCI(`${title} (small mobile, landscape)`);

  cy.viewport("iphone-x");
  cy.screenshotCI(`${title} (large mobile)`);

  cy.viewport("ipad-2", "landscape");
  cy.screenshotCI(`${title} (tablet landscape)`);

  cy.viewport("ipad-2", "portrait");
  cy.screenshotCI(`${title} (tablet portrait)`);

  cy.viewport(1000, 660);
});

Cypress.Commands.add("apiRoute", (methodOrObject, url, stub) => {
  if (typeof methodOrObject === "string") {
    return cy.route(methodOrObject, `${Cypress.env("API_PREFIX")}${url}`, stub);
  } else {
    return cy.route({ ...methodOrObject, url: `${Cypress.env("API_PREFIX")}${methodOrObject.url}` });
  }
});

Cypress.Commands.add("stubCommonRoutes", () => {
  cy.fixture("owner").as("ownerFx");
  cy.fixture("footer").as("footerFx");

  cy.apiRoute("GET", "/owner", "@ownerFx");
  cy.apiRoute("GET", "/footer", "@footerFx");
});

Cypress.Commands.add("stubRoutesIndex", () => {
  cy.stubCommonRoutes();
  cy.fixture("latest-posts").as("latestPostsFx");
  cy.apiRoute("GET", "/blog/articles?page=0&pageSize=3&published=true", "@latestPostsFx");
});

Cypress.Commands.add("loggedIn", (expiry) => {
  expiry = expiry || dayjs().add(1, "hour").toISOString();
  localStorage.setItem("session-username", "admin");
  localStorage.setItem("session-expiry", expiry);
  cy.apiRoute("POST", "/login/refresh", { expiry });
});
