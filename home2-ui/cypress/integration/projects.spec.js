/* eslint-disable no-undef */

describe("/projects", () => {
  beforeEach(() => {
    cy.server();
    cy.stubCommonRoutes();
  });

  it("should render the page with projects and then navigate", () => {
    cy.fixture("projects-4").as("projects4FX");
    cy.apiRoute("GET", "/projects?published=true", "@projects4FX");

    cy.visit("/projects");

    cy.containsTitle("Projects");

    cy.containsProjectTab(0, "Project 1");
    cy.containsProjectTab(1, "Project 2", "/projects/project-2");
    cy.containsProjectTab(2, "Project 3", "/projects/project-3");
    cy.containsProjectTab(3, "Project 4", "/projects/project-4");

    cy.containsProjectTabs(4);

    cy.containsProjectLink(0, "Link One", "https://example.com");
    cy.containsProjectLink(1, "Link Two", "https://example.com/two");
    cy.containsProjectLink(2, "Link Three", "https://example.com/three");

    cy.get("div[data-id=project-description]").should("have.text", "The very first tester project");

    cy.containsHeader("Projects", false);
    cy.containsFooter();

    cy.screenshotCI("projects");

    cy.get("a[data-id=project-tab]").eq(1).should("have.text", "Project 3").click();

    cy.location("pathname").should("equal", "/projects/project-3");

    cy.containsTitle("Projects");

    cy.containsProjectTab(0, "Project 1", "/projects/project-1");
    cy.containsProjectTab(1, "Project 2", "/projects/project-2");
    cy.containsProjectTab(2, "Project 3");
    cy.containsProjectTab(3, "Project 4", "/projects/project-4");

    cy.containsProjectTabs(4);

    cy.containsProjectLink(0, "Link One 3", "https://example.com/3");
    cy.containsProjectLink(1, "Link Two 3", "https://example.com/3/two");
    cy.containsProjectLink(2, "Link Three 3", "https://example.com/3/three");

    cy.get("div[data-id=project-description]").should("have.text", "The very third tester project");

    cy.containsHeader("Projects", false);
    cy.containsFooter();
  });

  it("should render the page with the specific project and then navigate", () => {
    cy.fixture("projects-4").as("projects4FX");
    cy.apiRoute("GET", "/projects?published=true", "@projects4FX");

    cy.visit("/projects/project-2");

    cy.containsTitle("Projects");

    cy.containsProjectTab(0, "Project 1", "/projects/project-1");
    cy.containsProjectTab(1, "Project 2");
    cy.containsProjectTab(2, "Project 3", "/projects/project-3");
    cy.containsProjectTab(3, "Project 4", "/projects/project-4");

    cy.containsProjectTabs(4);

    cy.containsProjectLink(0, "Link One 2", "https://example.com/2");
    cy.containsProjectLink(1, "Link Two 2", "https://example.com/2/two");
    cy.containsProjectLink(2, "Link Three 2", "https://example.com/2/three");

    cy.get("div[data-id=project-description]").should("have.text", "The very second tester project");

    cy.containsHeader("Projects", false);
    cy.containsFooter();

    cy.get("a[data-id=project-tab]").eq(1).should("have.text", "Project 3").click();

    cy.location("pathname").should("equal", "/projects/project-3");

    cy.containsTitle("Projects");

    cy.containsProjectTab(0, "Project 1", "/projects/project-1");
    cy.containsProjectTab(1, "Project 2", "/projects/project-2");
    cy.containsProjectTab(2, "Project 3");
    cy.containsProjectTab(3, "Project 4", "/projects/project-4");

    cy.containsProjectTabs(4);

    cy.containsProjectLink(0, "Link One 3", "https://example.com/3");
    cy.containsProjectLink(1, "Link Two 3", "https://example.com/3/two");
    cy.containsProjectLink(2, "Link Three 3", "https://example.com/3/three");

    cy.get("div[data-id=project-description]").should("have.text", "The very third tester project");

    cy.containsHeader("Projects", false);
    cy.containsFooter();
  });

  it("should render page without any projects", () => {
    cy.apiRoute("GET", "/projects?published=true", []);

    cy.visit("/projects");

    cy.containsTitle("Projects");

    cy.get("[data-id=no-projects-found-message]").should("be.visible");
    cy.get("[data-id=projects-tabs]").should("not.be.visible");
    cy.get("[data-id=project-page]").should("not.be.visible");

    cy.screenshotCI("no projects configured message");
  });

  it("should render error page when project not found", () => {
    cy.fixture("projects-4").as("projects4FX");
    cy.apiRoute("GET", "/projects?published=true", "@projects4FX");

    cy.visit("/projects/project-non-existent");

    cy.get("[data-id=error-page]").should("contain.text", "Not Found");

    cy.screenshotCI("project not found message");
  });
});
