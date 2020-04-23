import React from 'react';
import {mount} from "enzyme";
import {FlatLogoList} from "./flat-logo-list";

describe("<FlatLogoList/>", () => {
  let logos = [
    {
      href: "/test/logo-link1",
      src: "/test/images/logo1.svg",
      name: "Test Logo 1"
    },
    {
      href: "/test/logo-link2",
      src: "/test/images/logo2.jpg",
      name: "Test Logo 2"
    }
  ];
  it('renders empty list', () => {
    mount(<FlatLogoList logos={[]}/>);
  });
  it('renders single logo', () => {
    let result = mount(<FlatLogoList logos={[logos[0]]}/>);
    expect(result.find("a").props()).toMatchObject({href: logos[0].href});
    expect(result.find("a").find("img").props()).toMatchObject({src: logos[0].src, alt: logos[0].name})
  });
  it('renders multiple logos', () => {
    let result = mount(<FlatLogoList logos={logos}/>);
    expect(result.find("a").filter({href: logos[0].href}).find("img").props()).toMatchObject({src: logos[0].src, alt: logos[0].name});
    expect(result.find("a").filter({href: logos[0].href}).find("img").props()).toMatchObject({src: logos[0].src, alt: logos[0].name});
  });
});
