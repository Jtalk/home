/* eslint-disable no-undef */
Cypress.Commands.add("containsProjectTab", (idx, title, href) => {
  if (href) {
    cy.get("[data-id=project-tab]")
      .eq(idx)
      .should("have.text", title)
      .should("have.attr", "href", href)
      .should("not.have.class", "active");
  } else {
    cy.get("[data-id=project-tab]").eq(idx).should("have.text", title).should("have.class", "active");
  }
});

Cypress.Commands.add("containsProjectTabs", (num) => {
  cy.get("[data-id=project-tab]").eq(num).should("not.exist");
});

Cypress.Commands.add("containsProjectLink", (idx, caption, href) => {
  cy.get("a[data-id=project-link]").eq(idx).should("have.text", caption).should("have.attr", "href", href);
});
