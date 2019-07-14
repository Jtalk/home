import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.css';
import {App} from './App';
import * as serviceWorker from './serviceWorker';
import {createAppStore} from "./data/redux";
import {Provider} from "react-redux";
import {AjaxProvider} from "./context/ajax-context";

const store = createAppStore();

ReactDOM.render(
    <Provider store={store}>
        <AjaxProvider>
            <App/>
        </AjaxProvider>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
