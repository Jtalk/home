/* eslint-disable no-undef */

Cypress.Commands.add("containsArticlePreview", (idx, title, url, content, tags, dateMatcher) => {
  cy.get("[data-id=blog-article-view]")
    .eq(idx)
    .within(() => {
      cy.get("[data-id=header] a").should("have.attr", "href", url).should("have.text", title);
      tags.forEach((tag, i) => {
        cy.get("[data-id=article-tag]").eq(i).should("have.text", tag);
      });
      cy.get("[data-id=content]").should("have.text", content);
      cy.get("[data-id=read-further-button]").should("have.attr", "href", url).should("have.text", "Read further");
      cy.get("[data-id=created-at]").then((created) => {
        // Weird, but fair enough (there's no Date.fromLocaleString, unfortunately)
        expect(created.text()).to.match(dateMatcher);
      });
    });
});

Cypress.Commands.add("containsArticlesCount", (n) => {
  if (n === 0) {
    cy.get("[data-id=blog-article-view]").should("not.exist");
  } else {
    cy.get("[data-id=blog-article-view]").eq(n).should("not.exist");
  }
});

Cypress.Commands.add("containsPagination", (pages, activePage) => {
  cy.get("[data-id=articles-pagination]").within(() => {
    for (let i = 0; i < pages; i++) {
      cy.get("[data-id=page-button]")
        .eq(i)
        .should("have.text", i + 1)
        .should(i + 1 === activePage ? "have.class" : "not.have.class", "active");
    }
    cy.get("[data-id=page-button]").eq(pages).should("not.exist");
  });
});

Cypress.Commands.add("containsArticle", (title, content, tags, dateMatcher) => {
  cy.get("[data-id=blog-article-view]").within(() => {
    cy.get("[data-id=header]").should("have.text", title);
    tags.forEach((tag, i) => {
      cy.get("[data-id=article-tag]").eq(i).should("have.text", tag);
    });
    cy.get("[data-id=content]").should("have.text", content);
    cy.get("[data-id=read-further-button]").should("not.exist");
    cy.get("[data-id=created-at]").then((created) => {
      // Weird, but fair enough (there's no Date.fromLocaleString, unfortunately)
      expect(created.text()).to.match(dateMatcher);
    });
  });
});
