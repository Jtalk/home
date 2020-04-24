import React from 'react';
import {mount} from "enzyme";

import {VerticalSeparator} from "./vertical-separator";

describe("<VerticalSeparator/>", () => {
  let separator = "%$£&*^%£$$%";
  it('renders sparse separator by default', () => {
    let result = mount(<VerticalSeparator sparse separator={separator}/>);
    expect(result.find("span").props().children).toBe(` ${separator} `);
  });
  it('renders non-sparse separator if requested', () => {
    let result = mount(<VerticalSeparator separator={separator}/>);
    expect(result.find("span").props().children).toBe(separator);
  });
  it('renders nothing if sparse=false and separator=undefined', () => {
    let result = mount(<VerticalSeparator/>);
    expect(result.find("span").props().children).toBe("");
  });
  it('renders space if sparse=true and separator=undefined', () => {
    let result = mount(<VerticalSeparator sparse/>);
    expect(result.find("span").props().children).toBe(" ");
  });
});
