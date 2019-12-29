import React from 'react';
import {mount, shallow} from "enzyme";
import {Button, Card, CardContent, CardDescription, Image, Menu} from "semantic-ui-react";
import {EditImagesStateless, ImageUpload, ViewImage, ViewImages} from "./edit-images";
import {MemoryRouter} from "react-router"
import {Link} from "react-router-dom";
import {Pagination} from "../shared/pagination";

const ownerName = "Test Owner";
const images = [
    {
        id: "abc-def-1",
        description: "A test image 1",
        src: "https://example.com/some-image.png",
        uploadedDateTime: new Date(2018, 11, 6, 13, 35)
    },
    {
        id: "abc-def-2",
        description: "A test image 2",
        src: "https://example.com/some-image1.png",
        uploadedDateTime: new Date(2018, 11, 6, 13, 37)
    },
    {
        id: "abc-def-3",
        description: "A test image 3",
        src: "https://example.com/some-image2.png",
        uploadedDateTime: new Date(2016, 3, 6, 11, 3)
    },
];
const pagination = {
  current: 0,
  total: 2
};

describe("<EditImagesStateless/>", () => {
  it('renders without errors', () => {
    mount(
      <MemoryRouter>
        <EditImagesStateless {...{ownerName, images, pagination}}/>
      </MemoryRouter>
    );
  });
  it('renders without images or pagination', () => {
    mount(<EditImagesStateless {...{ownerName}} images={[]} pagination={{current: 0, total: 0}}/>);
  });
  it('renders pagination properly', () => {
    let result = mount(
      <MemoryRouter>
        <EditImagesStateless {...{ownerName}} images={[]} pagination={{current: 1, total: 3}}/>
      </MemoryRouter>
    );
    let pagination = result.findWhere(n => n.is(Pagination));
    let paginationMenu = pagination.findWhere(n => n.is(Menu)).find({pagination: true});
    let selectedPageItem = paginationMenu.find(Menu.Item);
    let otherPages = paginationMenu.find("a");
    console.log(otherPages.debug());
    expect(selectedPageItem.props()).toMatchObject({active: true, children: 2});
    expect(otherPages.find({children: 1}).props().className).toBe("item");
    expect(otherPages.find({children: 3}).props().className).toBe("item");
    expect(otherPages).toHaveLength(2);
  });
  it('renders no pagination controls for <=1 pages', () => {
    let result = mount(<EditImagesStateless {...{ownerName}} images={[]} pagination={{current: 0, total: 0}}/>);
    let pagination = result.findWhere(n => n.is(Pagination));
    expect(pagination.props().children).toBeFalsy();
  });
});


const onDeleteNoop = (e, id) => {};

describe("<ViewImages/>", () => {
  const testImages = [
    {
      id: "abc-def-egh-1",
      description: "A test image 1",
      src: "https://example.com/some-image.png",
      uploadedDateTime: new Date(2018, 11, 6, 13, 35)
    },
    {
      id: "abc-def-egh-2",
      description: "A test image 2",
      src: "https://example.com/some-image1.png",
      uploadedDateTime: new Date(2018, 11, 6, 13, 37)
    },
    {
      id: "abc-def-egh-3",
      description: "A test image 3",
      src: "https://example.com/some-image2.png",
      uploadedDateTime: new Date(2016, 3, 6, 11, 3)
    },
  ];
  it('renders without errors', () => {
    mount(<ViewImages images={testImages} onDelete={onDeleteNoop}/>);
  });
  it('renders all cards', () => {

    let result = mount(<ViewImages images={testImages} onDelete={onDeleteNoop}/>);

    expect(result.find(Card)).toHaveLength(3);
    expect(result.findWhere(n => n.is(ViewImage) && n.key() === testImages[0].id).exists()).toBe(true);
    expect(result.findWhere(n => n.is(ViewImage) && n.key() === testImages[1].id).exists()).toBe(true);
    expect(result.findWhere(n => n.is(ViewImage) && n.key() === testImages[2].id).exists()).toBe(true);
  });
});

describe("<ViewImage/>", () => {
  const testImage = {
    id: "abc-def-egh",
    description: "A test image 1",
    src: "https://example.com/some-image.png",
    uploadedDateTime: new Date(2018, 11, 6, 13, 35)
  };
  it('renders fully without errors', () => {
    mount(<ViewImage {...testImage} onDelete={onDeleteNoop}/>);
  });
  it('renders underlying entities', () => {

    let result = shallow(<ViewImage {...testImage} onDelete={onDeleteNoop}/>);

    expect(result.find(Image).props()).toMatchObject({src: testImage.src, alt: testImage.description});
    expect(result.find(CardDescription).contains(testImage.description)).toBe(true);
  });
  it('renders without optional fields', () => {

    let bareImage = Object.assign({}, testImage, {description: undefined, uploadedDateTime: undefined});
    let result = shallow(<ViewImage {...bareImage} onDelete={onDeleteNoop}/>);

    console.log("a", bareImage);

    expect(result.find(CardDescription).children().length).toBe(1);
    expect(result.findWhere(n => n.is(CardContent) && n.props()["extra"]).children().length).toBe(0);
  });
  it('propagates Delete button click', () => {
    let onDelete = jest.fn((e, id) => {});
    let result = shallow(<ViewImage {...testImage} deleteImage={onDelete}/>);
    result.find(Button).simulate("click");
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(testImage.id);
  });
});