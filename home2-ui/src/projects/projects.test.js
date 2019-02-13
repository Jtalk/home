import React from 'react';
import * as Enzyme from "enzyme";
import {mount} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';

import Projects from "./projects";
import {MemoryRouter} from "react-router";

Enzyme.configure({ adapter: new Adapter() });

describe("<Projects/>", () => {
  let projects = [
    {
      title: "Sample Project 1",
      id: "sample-proj-1",
      href: "/test/proj/sample-p1",
      logo: "/test/logo.jpg",
      description: "A sample project description with [b]stuff[/b]",
      links: [
        {name: "Link 1", href: "/test/link1"},
        {name: "Link 2", href: "/test/link2"},
        {name: "Link 3", href: "/test/link3"},
      ]
    },
    {
      title: "Sample Project 2",
      id: "sample-proj-2",
      href: "/test/proj/sample-p1",
      logo: "/test/logo.jpg",
      description: "A sample project description with [b]stuff[/b]",
      links: [
        {name: "Link 1", href: "/test/link1"},
        {name: "Link 2", href: "/test/link2"},
        {name: "Link 3", href: "/test/link3"},
      ]
    }
  ];
  it('renders without errors', () => {
    mount(<MemoryRouter>
      <Projects projects={projects} selectedProject={projects[1]} selectedProjectId={projects[1].id} />
    </MemoryRouter>);
  });
});
