import React from 'react';

describe("<App/>", () => {
    // let store = createAppStore();
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
