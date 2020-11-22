/* eslint-disable no-undef */
Cypress.Commands.add("containsSearchResult", (index, href, header, description) => {
  cy.get("div[data-id=header-search-bar] .results a[data-id=search-result-link]")
    .eq(index)
    .should("have.attr", "href", href);
  cy.get("div[data-id=header-search-bar] a[data-id=search-result-link] div[data-id=search-result-title]")
    .eq(index)
    .should("have.text", header);
  cy.get("div[data-id=header-search-bar] a[data-id=search-result-link] div[data-id=search-result-description]")
    .eq(index)
    .should("contain.text", description);
});

Cypress.Commands.add("containsSearchResults", (n) => {
  cy.get("div[data-id=header-search-bar] .results a[data-id=search-result-link]").eq(n).should("not.be.visible");
});

Cypress.Commands.add("containsSearchCategory", (index, name) => {
  cy.get("div[data-id=header-search-bar] .results .category .name").eq(index).should("have.text", name);
});

Cypress.Commands.add("containsSearchCategories", (n) => {
  cy.get("div[data-id=header-search-bar] .results .category .name").eq(n).should("not.be.visible");
});
