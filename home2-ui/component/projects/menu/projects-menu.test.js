import React from 'react';
import {shallow} from "enzyme";

import Link from "next/link";
import {ProjectsMenu} from "./projects-menu";
import {Menu} from "semantic-ui-react";
import {ProjectTab} from "./projects-menu-tab";

describe("<ProjectsMenu/>", () => {
  let projects = [
    { id: "project-1", title: "Project 1", href: "/project-1"},
    { id: "project-2", title: "Project 2", href: "/project-2"},
    { id: "project-3", title: "Project 3", href: "/project-3"},
  ];
  it('renders items with active link highlighted', () => {
    let result = shallow(<ProjectsMenu projects={projects} selectedProjectId={projects[1].id}/>).dive();
    expect(result.find(ProjectTab).at(0).props()).toMatchObject({project: projects[0]});
    expect(result.find(ProjectTab).at(1).props()).toMatchObject({active: true, project: projects[1]});
    expect(result.find(ProjectTab).at(2).props()).toMatchObject({project: projects[2]});
  });
  it('renders when no projects', () => {
    let result = shallow(<ProjectsMenu/>);
    expect(result.find(Menu).exists()).toBe(true);
  });
});
