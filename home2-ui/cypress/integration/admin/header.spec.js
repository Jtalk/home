/* eslint-disable no-undef */

describe("/", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
    cy.loggedIn();
    cy.visit("/");
  });
  describe("header", () => {
    it("should render admin navigation when authenticated", () => {
      cy.get("[data-id=header]:visible [data-id=header-admin-dropdown]").should("exist").click();
      cy.get("[data-id=header-admin-dropdown]:visible")
        .should("exist")
        .within(() => {
          cy.get("[data-id=bio]")
            .should("have.text", "Bio")
            .should("not.have.class", "active")
            .should("have.attr", "href", "/admin/bio");
          cy.get("[data-id=projects]")
            .should("have.text", "Projects")
            .should("not.have.class", "active")
            .should("have.attr", "href", "/admin/projects");
          cy.get("[data-id=blog]")
            .should("have.text", "Blog")
            .should("not.have.class", "active")
            .should("have.attr", "href", "/admin/blog/articles");
          cy.get("[data-id=images]")
            .should("have.text", "Images")
            .should("not.have.class", "active")
            .should("have.attr", "href", "/admin/images");
          cy.get("[data-id=footer]")
            .should("have.text", "Footer")
            .should("not.have.class", "active")
            .should("have.attr", "href", "/admin/footer");
          cy.get("a").eq(5).should("not.exist");
          cy.screenshotCI("admin dropdown");
        });
      cy.get("[data-id=header]:visible [data-id=header-account-dropdown]").should("exist").click();
      cy.get("[data-id=header]:visible [data-id=header-account-dropdown]")
        .should("exist")
        .within(() => {
          cy.get("[data-id=account-name]").should("have.text", "Cypress Bot");
          cy.get("a[data-id=settings]").should("have.text", "Account").should("have.attr", "href", "/admin/account");
          cy.get("[data-id=logout-button]").should("have.text", "Sign out");
          cy.get("a").eq(2).should("not.exist");
          cy.screenshotCI("account dropdown");
        });

      // Logout
      cy.apiRoute("POST", "/logout", {});
      cy.get("[data-id=logout-button]:visible").click();
      cy.get("[data-id=header-account-dropdown]")
        .should("not.exist")
        .then(() => {
          // eslint-disable-next-line no-unused-expressions
          expect(localStorage.getItem("session-username")).to.not.exist;
          // eslint-disable-next-line no-unused-expressions
          expect(localStorage.getItem("session-expiry")).to.not.exist;
        });
    });
  });
});
