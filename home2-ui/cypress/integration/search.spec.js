/* eslint-disable no-undef */

describe("/", () => {
  describe("search", () => {
    beforeEach(() => {
      cy.server();
      cy.stubRoutesIndex();
      cy.visit("/");
    });
    it("should operate search", () => {
      // Empty result
      cy.route("GET", `/search?q=a&max=20`, []).as("searchNothing");
      cy.get("div[data-id=header-search-bar] input").should("be.visible").type("a");
      cy.get("div[data-id=header-search-bar] input").should("have.attr", "value", "a");
      cy.wait("@searchNothing");
      // Should contain no results
      cy.get("div[data-id=header-search-bar] .results").should("contain.text", "No results found");
      cy.screenshotCI("search empty results");
      cy.get("div[data-id=header-search-bar] input").clear();

      // Single result, owner
      cy.route("GET", `/search?q=g&max=20`, []);
      cy.route("GET", `/search?q=gr&max=20`, []);
      cy.route("GET", `/search?q=gre&max=20`, []);
      cy.route("GET", `/search?q=grea&max=20`, []);
      cy.fixture("owner").then((ownerFx) => {
        const response = [{ type: "owner", value: ownerFx }];
        cy.route("GET", `/search?q=great&max=20`, response).as("searchSingleOwner");
      });
      cy.get("div[data-id=header-search-bar] input").should("be.visible").type("great");
      cy.get("div[data-id=header-search-bar] input").should("have.attr", "value", "great");
      cy.wait("@searchSingleOwner");
      cy.containsSearchCategory(0, "owner");
      cy.containsSearchCategories(1);
      // Should contain single result
      cy.containsSearchResult(0, "/", "Owner", "great");
      // No more results
      cy.containsSearchResults(1);
      cy.screenshotCI("search single result");
      cy.get("div[data-id=header-search-bar] input").clear();

      // Multiple results in multiple categories
      cy.route("GET", `/search?q=t&max=20`, []);
      cy.route("GET", `/search?q=te&max=20`, []);
      cy.route("GET", `/search?q=tes&max=20`, []);
      cy.fixture("owner").then((ownerFx) => {
        cy.fixture("projects-4").then((projectsFx) => {
          cy.fixture("articles-5").then((articlesFx) => {
            const response = [
              { type: "owner", value: ownerFx },
              { type: "project", value: projectsFx[0] },
              { type: "project", value: projectsFx[1] },
              { type: "article", value: articlesFx.data[2] },
              { type: "article", value: articlesFx.data[0] },
              { type: "article", value: articlesFx.data[1] },
            ];
            cy.route("GET", `/search?q=test&max=20`, response).as("searchMultipleResults");
          });
        });
      });
      cy.get("div[data-id=header-search-bar] input").should("be.visible").type("test");
      cy.get("div[data-id=header-search-bar] input").should("have.attr", "value", "test");
      cy.wait("@searchMultipleResults");
      cy.containsSearchCategory(0, "owner");
      cy.containsSearchCategory(1, "project");
      cy.containsSearchCategory(2, "article");
      cy.containsSearchCategories(3);
      // Should contain single result
      cy.containsSearchResult(0, "/", "Owner", "good testing stub");
      cy.containsSearchResult(1, "/projects/project-1", "Project 1", "first tester project");
      cy.containsSearchResult(2, "/projects/project-2", "Project 2", "second tester project");
      cy.containsSearchResult(3, "/blog/articles/article-3", "Article 3", "third test article's content");
      cy.containsSearchResult(4, "/blog/articles/article-1", "Article 1", "first");
      cy.containsSearchResult(5, "/blog/articles/article-2", "Article 2", "second test article's content");
      // No more results
      cy.containsSearchResults(6);
      cy.screenshotCI("search multiple results");
      cy.get("div[data-id=header-search-bar] input").clear();
    });
  });
});
