import React from "react";
import "../bbcode/tags";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {Projects} from "./projects";
import {NotFound} from "../error/not-found";

export const ProjectsRouter = function () {
    return <Router>
        <Switch>
            <Route exact path="/projects/:projectId?" render={params => {
                let selectedProjectId = params.match.params.projectId;
                return <Projects selectedProjectId={selectedProjectId} />
            }}/>
            <Route render={() => <NotFound/>}/>
        </Switch>
    </Router>
};
