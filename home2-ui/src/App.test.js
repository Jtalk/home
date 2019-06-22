import React from 'react';
import App from './App';
import {mount} from "enzyme";
import {Provider} from "react-redux";
import {createAppStore} from "./data/redux";

describe("<App/>", () => {
    let store = createAppStore();
    it('renders without crashing', () => {
        mount(<Provider store={store}>
            <App/>
        </Provider>,);
    });
});
