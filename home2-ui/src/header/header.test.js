import React from 'react';
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {expect} from "chai";
import Header from "./header";
import HeaderOwner from "./header-owner";
import {Menu} from "semantic-ui-react";
import HeaderSearch from "./header-search";
import HeaderMenuDropdownItem from "./header-menu-dropdown-item";
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";
import App from "../App";
import HeaderMenuItem from "./header-menu-item";

Enzyme.configure({ adapter: new Adapter() });

describe("<Header/>", () => {
  let links = [
    Header.buildLink("Item1", "/item1-link"),
    Header.buildLink("Item2", "/item2-link"),
    Header.buildSubmenuLinks("Item3", [
      Header.buildLink("item3.1", "/item31-link"),
      Header.buildLink("item3.2", "/item32-link"),
      Header.buildLink("item3.3", "/item33-link"),
    ]),
    Header.buildLink("Item4", "/item4-link"),
    Header.buildSubmenuLinks("Item5", [
      Header.buildLink("item5.1", "/item51-link"),
      Header.buildLink("item5.2", "/item52-link"),
    ]),
  ];
  it('renders menu with owner', () => {
    let result = shallow(<Header ownerName="Test Owner" links={links}/>);
    result = result.find(Menu).find(HeaderOwner);

    expect(result.props()).to.include({ownerName: "Test Owner"});
  });
  it('renders menu with search', () => {
    let result = shallow(<Header ownerName="Test Owner" links={links}/>);
    result = result.find(Menu.Menu, {right: true}).find(HeaderSearch);

    expect(result).to.be.an("object");
  });
  it('renders menu with links', () => {
    let result = shallow(<Header ownerName="Test Owner" activeLink="Item2" links={links}/>);
    result = result.find(HeaderMenuItem);

    expect(result.at(0).props()).to.include({link: links[0], activeLink: "Item2"});
    expect(result.at(1).props()).to.include({link: links[1], activeLink: "Item2"});
    expect(result.at(2).props()).to.include({link: links[3], activeLink: "Item2"});
  });
  it('renders menu with dropdown', () => {
    let result = shallow(<Header ownerName="Test Owner" activeLink="Item2" links={links}/>);
    result = result.find(HeaderMenuDropdownItem);

    expect(result.at(0).props()).to.include({title: "Item3", items: links[2].submenu});
    expect(result.at(1).props()).to.include({title: "Item5", items: links[4].submenu});
  });
  it('passes arguments to children properly', () => {
    mount(<MemoryRouter>
      <Header ownerName="Test Owner" activeLink="About" links={links}/>
    </MemoryRouter>);
  });
});
