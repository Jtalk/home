import React from "react";
import {Divider, Form, Grid, Icon, List, Segment} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";

export default class EditFooter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            links: [
                {caption: "About", url: "/index.html"},
                {caption: "Source", url: "https://bitbucket.org/__jtalk/home2"},
                {caption: "LinkedIn", url: "https://linkedin.com/in/jtalkme"},
                {caption: "BitBucket", url: "https://bitbucket.org/__jtalk/"},
                {caption: "StackOverflow", url: "https://stackoverflow.com/users/752977/roman-nazarenko"},
            ],
            executed: undefined,
            errorMessage: undefined
        }
    }

    render() {
        return <Grid centered>
            <Grid.Column width={13}>
                <Segment raised>
                    <h1>Edit Footer</h1>
                    <Divider/>
                    <Form error={this.state.errorMessage} success={this.state.executed && !this.statee.errorMessage}>
                        <h2>Edit links</h2>
                        <Form.Input label="New Link Caption" placeholder="A text to show for this link"/>
                        <Form.Input label="New Link URL" placeholder="URL"/>
                        <ErrorMessage message={this.state.errorMessage}/>
                        <SuccessMessage message="Link has been added successfully!"/>
                        <Form.Button primary>Create</Form.Button>
                    </Form>
                    <Divider/>
                    <List divided relaxed>
                        {
                            this.state.links.map((link, i, links) => {
                                return <List.Item key={link.caption}>
                                    <List.Content floated="right">
                                        <Icon name={i === 0 ? "lock" : "up arrow"}/>
                                        <Icon name={i === links.length - 1 ? "lock" : "down arrow"}/>
                                        <Icon color="red" name="remove"/>
                                    </List.Content>
                                    <List.Content>
                                        <List.Header as="h3">
                                            {link.caption}
                                        </List.Header>
                                        <List.Description>
                                            {link.url}
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            })
                        }
                    </List>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Footer";
    }

    _onChange(event) {

    }
}