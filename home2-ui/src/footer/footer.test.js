import React from 'react';
import {mount, shallow} from "enzyme";
import FlatLinksList from "./flat-links-list";
import FlatLogoList from "./flat-logo-list";
import {Container, Segment} from "semantic-ui-react";
import {Footer, StatelessFooter} from "./footer";
import {Provider} from "react-redux";
import {fromJS} from "immutable";
import {createTestStore} from "../data/redux";
import {AjaxProvider} from "../context/ajax-context";

let links = [
  {caption: "Link1", href: "/test/link1"},
  {caption: "Link2", href: "test/link2"},
  {caption: "Link3", href: "test/link3"}
];
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

describe("<StatelessFooter/>", () => {
  it('renders without errors', () => {
    mount(<StatelessFooter links={links} logos={logos}/>);
  });
  it('renders without links or logos', () => {
    mount(<StatelessFooter links={[]} logos={[]}/>);
  });
  it('forwards links and logos to proper children', () => {
    let result = shallow(<StatelessFooter links={links} logos={logos}/>);
    expect(result.find(FlatLinksList).props()).toMatchObject({links: links});
    expect(result.find(FlatLogoList).props()).toMatchObject({logos: logos});
  });
  it('renders centrally aligned', () => {
    let result = shallow(<StatelessFooter links={links} logos={logos}/>);
    // I've got absolutely no idea how to test it more appropriately
    expect(result.findWhere(n => n.is(Container) && n.props().textAlign !== "center").getElements().length).toBe(0);
    expect(result.findWhere(n => n.is(Segment) && n.props().textAlign !== "center").getElements().length).toBe(0);
  });
});

describe("<Footer/>", () => {

  let store = createTestStore("footer", () => fromJS({
      data: {
        links: links,
        logos: logos,
      }
  }));
  let ajaxMock = {
    footer: {
      load: jest.fn(() => {})
    }
  };

  it('calls the loading function upon mounting', () => {
    mount(<Provider store={store}>
      <AjaxProvider ajax={ajaxMock}>
        <Footer/>
      </AjaxProvider>
    </Provider>);
    expect(ajaxMock.footer.load.mock.calls.length).toBeGreaterThan(0);
  });
  it('renders data from the store', () => {
    let result = mount(<Provider store={store}>
      <AjaxProvider ajax={ajaxMock}>
        <Footer/>
      </AjaxProvider>
    </Provider>);
    expect(result.findWhere(n => n.is(FlatLinksList)).props().links).toEqual(links);
    expect(result.findWhere(n => n.is(FlatLogoList)).props().logos).toEqual(logos);
  });
});