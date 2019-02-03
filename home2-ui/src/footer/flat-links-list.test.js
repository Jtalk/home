import React from 'react';
import * as Enzyme from "enzyme";
import {mount} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {expect} from "chai";
import FlatLinksList from "./flat-links-list";
import VerticalSeparator from "./vertical-separator";

Enzyme.configure({ adapter: new Adapter() });

describe("<FlatLinksList/>", () => {
  let separator = "%$£&*^%£$$%";
  it('renders empty list', () => {
    mount(<FlatLinksList links={[]} separator={separator}/>);
  });
  it('renders single link without separator', () => {
    let link = {name: "Test Link", href: "/test/link"};
    let result = mount(<FlatLinksList links={[link]} separator={separator}/>);
    expect(result.find("a").props()).to.include({href: link.href, children: link.name});
    expect(result.find(VerticalSeparator).exists()).to.be.equal(false);
  });
  it('renders multiple links with separators', () => {
    let links = [
      {name: "Test Link 1", href: "/test/link1"},
      {name: "Test Link 2", href: "/test/link2"},
      {name: "Test Link 3", href: "/test/link2"}, // Duplicate links are supported, duplicate names are not
    ];
    let result = mount(<FlatLinksList links={links} separator={separator}/>);
    expect(result.childAt(0).filter('a').props()).to.include({href: links[0].href, children: links[0].name});
    expect(result.childAt(1).props()).to.include({separator: separator});
    expect(result.childAt(2).filter('a').props()).to.include({href: links[1].href, children: links[1].name});
    expect(result.childAt(3).props()).to.include({separator: separator});
    expect(result.childAt(4).filter('a').props()).to.include({href: links[2].href, children: links[2].name});
    expect(result.childAt(5).exists()).to.be.equal(false);
  });
});
