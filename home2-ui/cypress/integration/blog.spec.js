/* eslint-disable no-undef */

describe("/blog/articles", () => {
  beforeEach(() => {
    cy.server();
    cy.stubRoutesIndex();
  });

  it("should render blog with articles & navigate accordingly", () => {
    cy.fixture("articles-5").as("articles5FX");
    cy.apiRoute("GET", "/blog/articles?page=0&pageSize=20&published=true", "@articles5FX");

    cy.visit("/blog/articles");

    cy.containsTitle("Articles");

    cy.containsArticlePreview(
      0,
      "Article 1",
      "/blog/articles/article-1",
      "The very first test article's content",
      ["first", "node"],
      /Created ((0?1.11)|(11.0?1)).2020/
    );
    cy.containsArticlePreview(
      1,
      "Article 2",
      "/blog/articles/article-2",
      "The very second test article's content",
      ["second", "node"],
      /Created ((0?2.11)|(11.0?2)).2020/
    );
    cy.containsArticlePreview(
      2,
      "Article 3",
      "/blog/articles/article-3",
      "The very third test article's content",
      ["third", "node"],
      /Created ((0?3.11)|(11.0?3)).2020/
    );
    cy.containsArticlePreview(
      3,
      "Article 4",
      "/blog/articles/article-4",
      "The very fourth test article's content",
      ["fourth", "node"],
      /Created ((0?4.11)|(11.0?4)).2020/
    );
    cy.containsArticlePreview(
      4,
      "Article 5",
      "/blog/articles/article-5",
      "The very fifth test article's content",
      ["fifth", "node"],
      /Created ((0?5.11)|(11.0?5)).2020/
    );
    cy.containsArticlesCount(5);
    cy.containsPagination(3, 1);

    cy.containsHeader("Blog", false);
    cy.containsFooter();
    cy.containsOwnerCard();
    cy.containsLatestPosts(3);

    cy.screenshotCI("articles");

    cy.fixture("articles-5").then((articles) => {
      cy.apiRoute("GET", "/blog/articles/article-3", articles.data[2]).as("article3");
    });
    cy.get("[data-id=blog-article-view] [data-id=header] a").eq(2).click();
    cy.location("pathname").should("equal", "/blog/articles/article-3");
    cy.containsTitle("Article 3", "Articles");
    // Just make sure we've changed what's rendered to a single article view. To be tested properly in a separate feature below.
    cy.containsArticlesCount(1);

    cy.go("back");
    cy.location("pathname").should("equal", "/blog/articles");

    cy.get("[data-id=blog-article-view] a[data-id=read-further-button]").eq(2).click();
    cy.location("pathname").should("equal", "/blog/articles/article-3");
    cy.containsTitle("Article 3", "Articles");
    // Just make sure we've changed what's rendered to a single article view. To be tested properly in a separate feature below.
    cy.containsArticlesCount(1);

    cy.screenshotsCI("articles");
  });

  it("should render a different blog page", () => {
    cy.fixture("articles-5").as("articles5FX");
    cy.apiRoute("GET", "/blog/articles?page=2&pageSize=20&published=true", "@articles5FX");

    cy.visit("/blog/articles?page=3");

    cy.containsTitle("Articles");

    cy.containsArticlePreview(
      4,
      "Article 5",
      "/blog/articles/article-5",
      "The very fifth test article's content",
      ["fifth", "node"],
      /Created ((0?5.11)|(11.0?5)).2020/
    );
    cy.containsArticlesCount(5);
    cy.containsPagination(3, 3);
  });

  it("should render an empty blog", () => {
    cy.apiRoute("GET", "/blog/articles?page=0&pageSize=20&published=true", { data: [], pagination: { total: 0 } });

    cy.visit("/blog/articles");

    cy.containsTitle("Articles");

    cy.containsArticlesCount(0);
    cy.get("[data-id=articles-pagination]").should("not.exist");

    cy.screenshotCI("empty blog");

    cy.viewport("iphone-5");
    cy.screenshotCI("empty blog (mobile)");
  });

  it("should navigate through pagination", () => {
    cy.fixture("articles-5").as("articles5FX");
    cy.fixture("articles-1").as("articles1FX");
    cy.apiRoute("GET", "/blog/articles?page=0&pageSize=20&published=true", "@articles5FX");
    cy.apiRoute("GET", "/blog/articles?page=2&pageSize=20&published=true", "@articles1FX");

    cy.visit("/blog/articles");

    cy.containsArticlesCount(5);
    cy.containsPagination(3, 1);

    cy.get("[data-id=page-button]").eq(2).should("have.text", 3).click();
    cy.location("search").should("equal", "?page=3");

    cy.containsArticlesCount(1);
    cy.containsPagination(3, 3);

    cy.screenshotCI("articles last page single article");
  });

  describe("/{articleId}", () => {
    it("should render blog article", () => {
      cy.fixture("articles-1").then((articles) => {
        cy.apiRoute("GET", "/blog/articles/article-1", articles.data[0]);
      });

      cy.visit("/blog/articles/article-1");

      cy.containsTitle("Article 1", "Articles");

      cy.containsArticle(
        "Article 1",
        "The very first test article's contentText not visible in preview mode",
        ["first", "node"],
        /Created ((0?1.11)|(11.0?1)).2020/
      );
      cy.containsArticlesCount(1);

      cy.containsHeader("Blog", false);
      cy.containsFooter();
      cy.containsOwnerCard();
      cy.containsLatestPosts(3);

      cy.screenshotCI("article 1");
    });
  });
});
