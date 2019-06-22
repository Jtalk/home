import React from 'react';
import App from './App';
import {mount} from "enzyme";
import * as Enzyme from "enzyme/build";

import Adapter from "enzyme-adapter-react-16/build";
import {Provider} from "react-redux";
import {createAppStore} from "./data/redux";

Enzyme.configure({adapter: new Adapter()});

describe("<App/>", () => {
    let store = createAppStore();
    it('renders without crashing', () => {
        mount(<Provider store={store}>
            <App/>
        </Provider>,);
    });
});
