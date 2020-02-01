import React from 'react';
import {App} from './App';
import {mount} from "enzyme";
import {Provider as ReduxProvider} from "react-redux";
import {createAppStore} from "./data/redux";
import {AjaxProvider} from "./context/ajax-context";

describe("<App/>", () => {
    let store = createAppStore();
    let ajax = mockAjax();
    it('renders without crashing', () => {
        // mount(
        //     <AjaxProvider ajax={ajax}>
        //         <ReduxProvider store={store}>
        //             <App/>
        //         </ReduxProvider>
        //     </AjaxProvider>
        // );
    });
});

function mockAjax() {
    return {
        owner: {
            load: async () => ({
                name: "Test Owner",
            }),
        },
        footer: {
            load: async () => ({
            }),
        },
    }
}