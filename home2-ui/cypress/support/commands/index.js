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
