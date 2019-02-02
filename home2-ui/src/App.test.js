import React from 'react';
import App from './App';
import {mount} from "enzyme";
import * as Enzyme from "enzyme/build";

import Adapter from "enzyme-adapter-react-16/build";

Enzyme.configure({adapter: new Adapter()});

describe("<App/>", () => {
    it('renders without crashing', () => {
        mount(<App/>);
    });
});
