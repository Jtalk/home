import React from 'react';
import {mount, shallow} from "enzyme";
import {FlatLinksList} from "./flat-links-list";
import {FlatLogoList} from "./flat-logo-list";
import {Footer, StatelessFooter} from "./footer";
import {Provider} from "react-redux";
import {END} from "redux-saga";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Container from "semantic-ui-react/dist/commonjs/elements/Container";

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

  let ajaxMock;
  let store;
  beforeEach(() => {
    let footerReducer = () => ({
      data: {
        links: links,
        logos: logos,
      }
    });
    ajaxMock = {
      footer: {
        load: jest.fn(() => {})
      }
    };
  });
  afterEach(async () => {
    await store.dispatch(END);
  });
  it('calls the loading function upon mounting', () => {
    mount(<Provider store={store}>
      <Footer/>
    </Provider>);
    expect(ajaxMock.footer.load).toHaveBeenCalled();
  });
  it('renders data from the store', () => {
    let result = mount(<Provider store={store}>
      <Footer/>
    </Provider>);
    expect(result.find(FlatLinksList).props().links).toEqual(links);
    expect(result.find(FlatLogoList).props().logos).toEqual(logos);
  });
});
