/* eslint-disable no-undef */
describe("/admin/bio", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
    cy.loggedIn();
  });
  it("should navigate from menu", () => {
    cy.visit("/");
    cy.get("[data-id=header-admin-dropdown]:visible").should("be.visible").click();
    cy.get("[data-id=header-admin-dropdown]:visible a[data-id=bio]").should("be.visible").click();
    cy.location("pathname").should("equal", "/admin/bio");
    cy.containsTitle("Edit Bio");
  });
  it("should edit bio", function () {
    cy.visit("/admin/bio");
    cy.containsTitle("Edit Bio");

    cy.containsHeader(true);
    cy.containsFooter();

    cy.fixture("owner").as("ownerFx");
    cy.fixture("edited-owner").as("editedOwnerFx");

    // Successful edit
    cy.get("[data-id=edit-bio-form]")
      .should("be.visible")
      .within(() => {
        cy.screenshotCI("edit bio");

        cy.verifyInputAndEdit("[data-id=owner-name-input] input", this.ownerFx.name, this.editedOwnerFx.name);
        cy.verifyInputAndEdit(
          "[data-id=owner-nickname-input] input",
          this.ownerFx.nickname,
          this.editedOwnerFx.nickname
        );
        cy.verifyInputAndEdit(
          "[data-id=owner-email-input] input",
          this.ownerFx.contacts.email.value,
          this.editedOwnerFx.contacts.email.value
        );
        cy.verifyInputAndEdit(
          "[data-id=owner-short-bio-input] input",
          this.ownerFx.description,
          this.editedOwnerFx.description
        );
        cy.verifyInputAndEdit("textarea[data-id=owner-bio-input]", this.ownerFx.bio, this.editedOwnerFx.bio);

        cy.apiRoute("PUT", "/owner", "@editedOwnerFx").as("editCall");
        cy.apiRoute("GET", "/owner", "@editedOwnerFx");

        cy.get("[data-id=submit-button]").click();
        cy.wait("@editCall").its("requestBody").should("deep.equal", this.editedOwnerFx);

        cy.get("[data-id=success-message]").should("be.visible").should("have.text", "Changes successfully saved");
      });

    // Failed edit
    cy.get("[data-id=edit-bio-form]")
      .should("be.visible")
      .within(() => {
        cy.get("[data-id=owner-name-input] input").clear();
        cy.get("[data-id=owner-email-input] input").clear();

        cy.apiRoute({
          method: "PUT",
          url: "/owner",
          status: 400,
          response: { errors: ["Empty name", "Empty email"] },
        }).as("failEditOwner");
        cy.apiRoute("GET", "/owner", "@editedOwnerFx");

        cy.get("[data-id=submit-button]").click();
        cy.wait("@failEditOwner");
        cy.get("[data-id=error-message]").should("contain.text", "Empty name, Empty email");

        cy.screenshotCI("bio edit fail");
      });
  });
});
