import React from 'react';
import HeaderMenuDropdownItem from "./header-menu-dropdown-item";
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {Link} from "react-router-dom";

import HeaderMenuItem from "./header-menu-item";

Enzyme.configure({ adapter: new Adapter() });

describe("<HeaderMenuDropdownItem/>", () => {
  it('renders menu with links', () => {
    let result = shallow(<HeaderMenuDropdownItem title="TopLevel" items={[
      HeaderMenuItem.buildLink("Sublevel1", "/sublevel1-link", () => <div id="sublevel1-id"/>),
      HeaderMenuItem.buildLink("Sublevel2", "/sublevel2-link", () => <div id="sublevel2-id"/>),
      HeaderMenuItem.buildLink("Sublevel3", "/sublevel3-link", () => <div id="sublevel3-id"/>)
    ]}/>);
    result = result.find(Link);

    expect(result.at(0).props()).toMatchObject({to: "/sublevel1-link", children: "Sublevel1"});
    expect(result.at(1).props()).toMatchObject({to: "/sublevel2-link", children: "Sublevel2"});
    expect(result.at(2).props()).toMatchObject({to: "/sublevel3-link", children: "Sublevel3"});
  });
  it('renders menu with active link disabled', () => {
    let result = shallow(<HeaderMenuDropdownItem title="TopLevel" activeLink="Sublevel2" items={[
      HeaderMenuItem.buildLink("Sublevel1", "/sublevel1-link", () => <div id="sublevel1-id"/>),
      HeaderMenuItem.buildLink("Sublevel2", "/sublevel2-link", () => <div id="sublevel2-id"/>),
      HeaderMenuItem.buildLink("Sublevel3", "/sublevel3-link", () => <div id="sublevel3-id"/>)
    ]}/>);
    expect(result.find(".active.item").props()).toMatchObject({children: "Sublevel2"});
  });
});
