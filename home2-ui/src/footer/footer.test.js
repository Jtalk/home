import React from 'react';
import {mount, shallow} from "enzyme";

import {Footer} from "./footer";
import FlatLinksList from "./flat-links-list";
import FlatLogoList from "./flat-logo-list";
import {Container, Segment} from "semantic-ui-react";

describe("<Footer/>", () => {
  let links = [
    {caption: "Link1", href: "/test/link1"},
    {caption: "Link2", href: "test/link2"},
    {caption: "Link3", href: "test/link3"}
  ];
  let logos = [
    {
      href: "/test/logo-link1",
      src: "/test/images/logo1.svg",
      name: "Test Logo 1",
      height: 55
    },
    {
      href: "/test/logo-link2",
      src: "/test/images/logo2.jpg",
      name: "Test Logo 2",
      height: 40
    }
  ];
  let actions = {
    load: () => {}
  };
  it('renders without errors', () => {
    mount(<Footer links={links} logos={logos} {...actions}/>);
  });
  it('renders without links or logos', () => {
    mount(<Footer links={[]} logos={[]} {...actions}/>);
  });
  it('calls the loading function upon mounting', () => {
    actions.load = jest.fn(() => {});
    mount(<Footer links={[]} logos={[]} {...actions}/>);
    expect(actions.load.mock.calls.length).toBeGreaterThan(0);
  });
  it('forwards links and logos to proper children', () => {
    let result = shallow(<Footer links={links} logos={logos} {...actions}/>);
    expect(result.find(FlatLinksList).props()).toMatchObject({links: links});
    expect(result.find(FlatLogoList).props()).toMatchObject({logos: logos});
  });
  it('renders centrally aligned', () => {
    let result = shallow(<Footer links={links} logos={logos} {...actions}/>);
    // I've got absolutely no idea how to test it more appropriately
    expect(result.findWhere(n => n.is(Container) && n.props().textAlign !== "center").getElements().length).toBe(0);
    expect(result.findWhere(n => n.is(Segment) && n.props().textAlign !== "center").getElements().length).toBe(0);
  });
});
