import React from 'react';
import {shallow} from "enzyme";
import {Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {Pagination} from "./pagination";

describe("<Pagination/>", () => {
  it('renders without errors', () => {
    let pagination = {current: 1, total: 3};
    let result = shallow(<Pagination {...pagination}/>);
    expect(result.children().exists()).toBe(true);
  });
  it('renders nothing with 0 pages (uninitialised)', () => {
    let pagination = {current: 0, total: 0};
    let result = shallow(<Pagination {...pagination}/>);
    expect(result.children().exists()).toBe(false);
  });
  it('renders nothing with 1 page', () => {
    let pagination = {current: 0, total: 1};
    let result = shallow(<Pagination {...pagination}/>);
    expect(result.children().exists()).toBe(false);
  });
  it('renders current page non-clickable', () => {
    let pagination = {current: 1, total: 3};
    let result = shallow(<Pagination {...pagination}/>);
    expect(result.find(Menu.Item).props()).toMatchObject({active: true, children: 2});
  });
  it('renders other pages clickable', () => {
    let pagination = {current: 1, total: 3};
    let result = shallow(<Pagination {...pagination}/>);
    result = result.find(Link);
    expect(result.length).toBe(2);
    expect(result.find({children: 1}).props()).toMatchObject({to: "/admin/images/0"});
    expect(result.find({children: 3}).props()).toMatchObject({to: "/admin/images/2"});
  });
});
