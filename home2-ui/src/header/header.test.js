import React from 'react';
import * as Enzyme from "enzyme";
import {mount, shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {Header, buildLink, buildSubmenuLinks} from "./header";
import {HeaderOwner} from "./header-owner";
import {Menu} from "semantic-ui-react";
import {HeaderSearch} from "./header-search";
import {HeaderMenuDropdownItem} from "./header-menu-dropdown-item";
import {MemoryRouter} from "react-router";
import {HeaderMenuItem} from "./header-menu-item";

Enzyme.configure({ adapter: new Adapter() });

describe("<Header/>", () => {
  let links = [
    buildLink("Item1", "/item1-link"),
    buildLink("Item2", "/item2-link"),
    buildSubmenuLinks("Item3", [
      buildLink("item3.1", "/item31-link"),
      buildLink("item3.2", "/item32-link"),
      buildLink("item3.3", "/item33-link"),
    ]),
    buildLink("Item4", "/item4-link"),
    buildSubmenuLinks("Item5", [
      buildLink("item5.1", "/item51-link"),
      buildLink("item5.2", "/item52-link"),
    ]),
  ];
  it('renders menu with owner', () => {
    let result = shallow(<Header ownerName="Test Owner" links={links}/>);
    result = result.find(Menu).find(HeaderOwner);

    expect(result.props()).toMatchObject({ownerName: "Test Owner"});
  });
  it('renders menu with search', () => {
    let result = shallow(<Header ownerName="Test Owner" links={links}/>);
    result = result.find(Menu.Menu, {right: true}).find(HeaderSearch);

    expect(result).toBeDefined();
  });
  it('renders menu with links', () => {
    let result = shallow(<Header ownerName="Test Owner" activeLink="Item2" links={links}/>);
    result = result.find(HeaderMenuItem);

    expect(result.at(0).props()).toMatchObject({link: links[0], active: false});
    expect(result.at(1).props()).toMatchObject({link: links[1], active: true});
    expect(result.at(2).props()).toMatchObject({link: links[3], active: false});
  });
  it('renders menu with dropdown', () => {
    let result = shallow(<Header ownerName="Test Owner" activeLink="Item2" links={links}/>);
    result = result.find(HeaderMenuDropdownItem);

    expect(result.at(0).props()).toMatchObject({title: "Item3", items: links[2].submenu});
    expect(result.at(1).props()).toMatchObject({title: "Item5", items: links[4].submenu});
  });
  it('passes arguments to children properly', () => {
    mount(<MemoryRouter>
      <Header ownerName="Test Owner" activeLink="About" links={links}/>
    </MemoryRouter>);
  });
});
