/* eslint-disable no-undef */
describe("/admin/projects", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
    cy.loggedIn();
  });
  it("should navigate from menu", () => {
    cy.visit("/");
    cy.apiRoute("GET", "/projects?published=false", "fixture:projects-4");
    cy.get("[data-id=header-admin-dropdown]").should("be.visible").click();
    cy.get("[data-id=header-admin-dropdown] a[data-id=projects]").should("be.visible").click();
    cy.location("pathname").should("equal", "/admin/projects");
    cy.containsTitle("Edit Projects");
  });
});
