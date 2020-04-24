import React from 'react';
import {mount} from "enzyme";

import {FlatLinksList} from "./flat-links-list";
import {VerticalSeparator} from "./vertical-separator";

describe("<FlatLinksList/>", () => {
  let separator = "%$£&*^%£$$%";
  it('renders empty list', () => {
    mount(<FlatLinksList links={[]} separator={separator}/>);
  });
  it('renders single link without separator', () => {
    let link = {name: "Test Link", href: "/test/link"};
    let result = mount(<FlatLinksList links={[link]} separator={separator}/>);
    expect(result.find("a").props()).toMatchObject({href: link.href, children: link.caption});
    expect(result.find(VerticalSeparator).exists()).toBe(false);
  });
  it('renders multiple links with separators', () => {
    let links = [
      {caption: "Test Link 1", href: "/test/link1"},
      {caption: "Test Link 2", href: "/test/link2"},
      {caption: "Test Link 3", href: "/test/link2"}, // Duplicate links are supported, duplicate names are not
    ];
    let result = mount(<FlatLinksList links={links} separator={separator}/>);
    expect(result.find("div").childAt(0).filter('a').props()).toMatchObject({href: links[0].href, children: links[0].caption});
    expect(result.find("div").childAt(1).props()).toMatchObject({separator: separator});
    expect(result.find("div").childAt(2).filter('a').props()).toMatchObject({href: links[1].href, children: links[1].caption});
    expect(result.find("div").childAt(3).props()).toMatchObject({separator: separator});
    expect(result.find("div").childAt(4).filter('a').props()).toMatchObject({href: links[2].href, children: links[2].caption});
    expect(result.find("div").childAt(5).exists()).toBe(false);
  });
});
