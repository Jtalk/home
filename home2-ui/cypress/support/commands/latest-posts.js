/* eslint-disable no-undef */
Cypress.Commands.add("containsLatestPosts", (num) => {
  cy.get("div[data-id=latest-posts]")
    .should("be.visible")
    .within(() => {
      cy.get("h3[data-id=latest-posts-header]").should("have.text", "Latest Posts");

      for (let i = 0; i < num; i++) {
        cy.get("div[data-id=latest-post] h4[data-id=latest-post-caption] a")
          .eq(i)
          .should("have.attr", "href", `/blog/articles/stub-post-${i + 1}`)
          .should("have.text", `Stubby's Post #${i + 1}`);
        cy.get("div[data-id=latest-post] div[data-id=latest-post-created-timestamp]")
          .eq(i)
          .should("have.text", new Date(`2020-11-${15 - i}T12:34:56Z`).toLocaleString());
      }

      cy.get("div[data-id=latest-post] h4[data-id=latest-post-caption] a").eq(num).should("not.be.visible");
    });
});
