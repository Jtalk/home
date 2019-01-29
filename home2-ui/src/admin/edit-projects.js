import React from "react";
import {Divider, Form, Grid, Icon, Image, Input, List, Menu, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {Redirect, Switch} from "react-router";
import {ErrorMessage} from "../form/form-message";

export default class EditProjects extends React.Component {

    constructor(props) {
        super(props);
        let projects = [
            {
                title: "Project 1",
                id: "project-1",
                href: "/projects/project-1",
                editHref: "/admin/projects/project-1",
                logoHref: "/images/avatar.png",
                description: "[h1]Header 1 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                    " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                    " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                    " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                    " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                links: [{name: "BitBucket", href: "/example"}, {name: "Demo", href: "/example"}]
            },
            {
                title: "Project 2",
                id: "project-2",
                href: "/projects/project-2",
                editHref: "/admin/projects/project-2",
                logoHref: "/images/avatar.png",
                description: "[h1]Header 2 [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                    " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                    " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                    " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                    " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                links: [{name: "BitBucket", href: "/example"}, {name: "Demo", href: "/example"}]
            }
        ];
        this.state = {
            projects: projects,
            currentProject: projects.find(p => p.id === this.props.currentProjectId)
        }
    }

    render() {
        return <Grid centered>
            <Switch>
                <Redirect exact from="/admin/projects" to={this.state.projects[0].editHref}/>
            </Switch>
            <Grid.Column width={13}>
                <Segment raised>
                    <Menu tabular>
                        {
                            this.state.projects.map(project => project.id === this.props.currentProjectId
                            ? <Menu.Item active key={project.id}>{project.title}</Menu.Item>
                            : <Link className="item" to={project.editHref} key={project.id}>{project.title}</Link>)
                        }
                        <Menu.Item>
                            <Icon name="plus"/>
                        </Menu.Item>
                        <Menu.Menu position="right">
                            <Menu.Item>
                                <Icon name="left arrow"/>
                            </Menu.Item>
                            <Menu.Item>
                                <Icon name="right arrow"/>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    <Grid centered>
                        <Grid.Column width={15} layout="block">
                            {
                                this.state.projects.length === 0 ? <Segment raised><h2>No projects available</h2></Segment> : this._projectView()
                            }
                        </Grid.Column>
                    </Grid>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Projects";
    }

    _projectView() {
        return <div>
            <h2>Edit project</h2>
            <Form error={this.state.errorMessage} success={this.state.executed && this.state.errorMessage}>
                <Divider/>
                <Grid stackable centered>
                    <Grid.Row>
                        <Grid.Column width={11}>
                            <Form.Input label="Project Name" placeholder="Name"/>
                            <Form.Input label="Internal Name" placeholder="(letters, digits, dashes)"/>
                            <Form.Checkbox toggle label="This project is published"/>
                            <div className="field">
                                <label>Project links <Icon name="plus"/></label>
                                Edit and rearrange links shown at the left panel
                                <List celled verticalAlign="middle" ordered>
                                    {
                                        this.state.currentProject.links.map((link, i, links) => {
                                            return <List.Item key={link.name}>
                                                <List.Content floated="right">
                                                    <Icon name="edit"/>
                                                    <Icon name={i === 0 ? 'lock' : 'angle up'}/>
                                                    <Icon name={i === links.length - 1 ? 'lock' : 'angle down'}/>
                                                    <Icon name="remove" color="red"/>
                                                </List.Content>
                                                <List.Content>
                                                    <List.Header>{link.name}</List.Header>
                                                    <List.Description>
                                                        <Link to={link.href}/>
                                                    </List.Description>
                                                </List.Content>
                                            </List.Item>
                                        })
                                    }
                                </List>
                            </div>
                            <ErrorMessage message={this.state.errorMessage}/>
                        </Grid.Column>
                        <Grid.Column width={5}>
                            <Form.Field>
                                <Image src={this.state.currentProject.logoHref} alt="Current project logo"/>
                                <Input type="file" accept="image/jpeg, image/png, image/svg, image/gif"/>
                            </Form.Field>
                            <Form.Button primary>Save</Form.Button>
                            <Form.Button secondary>Clear</Form.Button>
                            <Form.Button color="red">Delete</Form.Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Form.TextArea autoHeight placeholder="Project Description" value={this.state.currentProject.description}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Form>
        </div>
    }


    _onChange(event) {

    }

    _confirmAndDelete(event) {

    }
}