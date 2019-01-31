import React from 'react';
import HeaderMenuDropdownItem from "./header-menu-dropdown-item";
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {Link} from "react-router-dom";
import {expect} from "chai";

Enzyme.configure({ adapter: new Adapter() });

describe("<HeaderMenuDropdownItem/>", () => {
  it('renders menu with links', () => {
    let result = shallow(<HeaderMenuDropdownItem title="TopLevel" items={[
      HeaderMenuDropdownItem.buildLink("Sublevel1", "/sublevel1-link", () => <div id="sublevel1-id"/>),
      HeaderMenuDropdownItem.buildLink("Sublevel2", "/sublevel2-link", () => <div id="sublevel2-id"/>),
      HeaderMenuDropdownItem.buildLink("Sublevel3", "/sublevel3-link", () => <div id="sublevel3-id"/>)
    ]}/>);
    result = result.find(Link);

    expect(result.at(0).props()).to.include({to: "/sublevel1-link", children: "Sublevel1"});
    expect(result.at(1).props()).to.include({to: "/sublevel2-link", children: "Sublevel2"});
    expect(result.at(2).props()).to.include({to: "/sublevel3-link", children: "Sublevel3"});
  });
  it('renders menu with active link disabled', () => {
    let result = shallow(<HeaderMenuDropdownItem title="TopLevel" activeLink="Sublevel2" items={[
      HeaderMenuDropdownItem.buildLink("Sublevel1", "/sublevel1-link", () => <div id="sublevel1-id"/>),
      HeaderMenuDropdownItem.buildLink("Sublevel2", "/sublevel2-link", () => <div id="sublevel2-id"/>),
      HeaderMenuDropdownItem.buildLink("Sublevel3", "/sublevel3-link", () => <div id="sublevel3-id"/>)
    ]}/>);
    expect(result.find(".active.item").props()).to.include({children: "Sublevel2"});
  });
});
