import React from 'react';
import * as Enzyme from "enzyme";
import {shallow} from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import {expect} from "chai";
import HeaderMenuItem from "./header-menu-item";
import {Link} from "react-router-dom";
import {Menu} from "semantic-ui-react";

Enzyme.configure({ adapter: new Adapter() });

describe("<HeaderMenuItem/>", () => {
  it('renders inactive item as link', () => {
    let link = HeaderMenuItem.buildLink("Test Item", "/test/item/link");
    let result = shallow(<HeaderMenuItem link={link}/>);
    expect(result.find(Link).props()).to.include({to: link.href, children: link.title});
  });
  it('renders active item as non-link', () => {
    let link = HeaderMenuItem.buildLink("Test Item", "/test/item/link");
    let result = shallow(<HeaderMenuItem link={link} activeLink={link.title}/>);
    expect(result.find(Link).exists()).to.be.equal(false);
    expect(result.find(Menu.Item).props()).to.include({active: true, children: link.title});
  });
});
