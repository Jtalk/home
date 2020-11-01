import React from "react";
import Link from "next/link";
import {NotFound} from "../error/not-found";
import {EditProject} from "./edit-project";
import maxBy from "lodash/maxBy";
import findIndex from "lodash/findIndex";
import {ContentPlaceholderOr} from "../placeholder/content-placeholder";
import {EditProjectsPath} from "../../utils/paths";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Menu from "semantic-ui-react/dist/commonjs/collections/Menu";
import LazyIcon from "../lazy-icon";
import {useProject, useProjects} from "../../data/hooks/projects/get";
import {useProjectUpdater} from "../../data/hooks/projects/update";

const NEW_PROJECT_ID = "new";
const MAKE_NEW_PROJECT = (order) => ({
    id: NEW_PROJECT_ID,
    title: "New Project",
    logoId: "",
    published: false,
    order: order,
    description: "",
    links: [],
});

export const EditProjects = function ({currentProjectId}) {

    let projects = useProjects(true);
    let currentProject = useProject(currentProjectId, true);

    let errorMessage = useProjectError();

    let submit = useProjectUpdater();

    if (projects && projects.length && currentProjectId && !currentProject) {
        return <NotFound/>
    }
    currentProjectId = currentProjectId || (currentProject && currentProject.id);
    return <EditProjectsStateless {...{projects, currentProject, currentProjectId, errorMessage, submit}}/>;
};

export const EditProjectsStateless = function ({projects, currentProject, currentProjectId, submit}) {
    let add = () => {
        let maxOrderProject = maxBy(projects, p => p.order);
        let maxOrder = (maxOrderProject && maxOrderProject.order) || -1;
        let newProject = MAKE_NEW_PROJECT(maxOrder + 1);
        submit(newProject.id, `${EditProjectsPath}/${newProject.id || ""}`, newProject, {});
    };
    let move = (shift) => {
        return () => {
            let currentProjectIndex = findIndex(projects, p => p.id === currentProjectId);
            if (currentProjectIndex === -1) {
                throw Error("Attempting to move a non-existent project id " + currentProjectId);
            }
            let targetIndex = currentProjectIndex + shift;
            if (targetIndex < 0 || targetIndex >= projects.length) {
                console.error(`Cannot move project ${currentProject.id} with ${shift}: already on the edge`, projects);
                return;
            }
            let targetProject = projects[targetIndex];

            let newSourceProject = {...currentProject, order: targetProject.order};
            let newTargetProject = {...targetProject, order: currentProject.order};
            if (newTargetProject.order === newSourceProject.order) {
                // resolve duplicating order issues
                if (shift > 0) {
                    newSourceProject.order += 1;
                } else {
                    newTargetProject.order += 1;
                }
            }
            submit(newSourceProject.id, null, newSourceProject);
            submit(newTargetProject.id, null, newTargetProject);
        };
    };

    return <Grid centered>
        <Grid.Column width={13}>
            <Segment raised>
                <ContentPlaceholderOr loading={!projects} lines={20}>
                    <Menu tabular>
                        {
                            (projects || []).map(project => project.id === currentProjectId
                                ? <Menu.Item active key={project.id}>{project.title}</Menu.Item>
                                : <Link href={`${EditProjectsPath}/${project.id || ""}`} key={project.id}>
                                    <a className="item">{project.title}</a>
                                </Link>)
                        }
                        <Menu.Item>
                            <LazyIcon link name="plus" disabled={!projects || (currentProject && currentProject.id === NEW_PROJECT_ID)}
                                  onClick={add}/>
                        </Menu.Item>
                        {currentProject && <Menu.Menu position="right">
                            <Menu.Item>
                                <LazyIcon link name="left arrow" onClick={move(-1)}/>
                            </Menu.Item>
                            <Menu.Item>
                                <LazyIcon link name="right arrow" onClick={move(1)}/>
                            </Menu.Item>
                        </Menu.Menu>}
                    </Menu>
                    <Grid centered>
                        <Grid.Column width={15} layout="block">
                            {
                                projects && projects.length
                                    ? <EditProject projectId={currentProjectId}/>
                                    : <Segment raised><h2>No projects available</h2></Segment>
                            }
                        </Grid.Column>
                    </Grid>
                </ContentPlaceholderOr>
            </Segment>
        </Grid.Column>
    </Grid>
};
