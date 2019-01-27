import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {Route, Switch} from "react-router";
import EditBio from "./edit-bio";
import WebError from "../error/web-error";
import EditBlog from "./edit-blog";

export default class AdminRouter extends React.Component {

    render() {
        return <Router>
            <Switch>
                <Route exact path="/admin/bio" render={() => <EditBio/>}/>
                <Route exact path="/admin/blog" render={() => <EditBlog/>}/>
                <Route render={() => <WebError httpCode={404} message="Not Found"/>}/>
            </Switch>
        </Router>
    }
}