import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {Projects} from "./projects";
import {Titled} from "react-titled";

export const ProjectsRouter = function () {
    return <Router>
        <Titled title={t => "Projects | " + t}/>
        <Switch>
            <Route exact path="/projects/:projectId?" render={params => {
                let selectedProjectId = params.match.params.projectId;
                return <Projects selectedProjectId={selectedProjectId} />
            }}/>
        </Switch>
    </Router>
};
