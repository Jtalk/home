import React from "react";
import {Button, Card, Divider, Form, Grid, Image, Menu, Segment} from "semantic-ui-react";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import {formatDateTime} from "../utils/date-time";
import {Link} from "react-router-dom";

export default class EditImages extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images: [
                { description: "A test image 1", href: "/images/avatar.png", uploadedDateTime: new Date(2018, 11, 6, 13, 35)},
                { description: "A test image 2", href: "/images/avatar.png", uploadedDateTime: new Date()},
                { description: "A test image 3", href: "/images/avatar.png", uploadedDateTime: new Date(2016, 3, 6, 11, 3)},
                { description: "A test image 4", href: "/images/avatar.png", uploadedDateTime: new Date()},
                { description: "A test image 5", href: "/images/avatar.png", uploadedDateTime: new Date()},
            ],
            pagination: {current: this.props.currentPageIdx && 0, pagesTotal: 3},
            executed: undefined,
            errorMessage: undefined
        }
    }

    render() {
        return <Grid centered>
            <Grid.Column width={16}>
                <Segment basic>
                    <h1>Uploaded Images</h1>
                    <Form error={this.state.errorMessage} success={this.state.executed && !this.state.errorMessage}>
                        <Form.Input label="Image Caption" placeholder="A description of the image"/>
                        <Form.Field>
                            <input type="file"/>
                        </Form.Field>
                        <SuccessMessage message="Image successfully uploaded"/>
                        <ErrorMessage message={this.state.errorMessage}/>
                        <Form.Button primary>Upload</Form.Button>
                    </Form>
                    <Divider/>
                    <Card.Group>
                        {
                            this.state.images.map((image, i) =>
                                <Card key={i} className="width-fit">
                                    <Image src={image.href} alt={image.description}/>
                                    <Card.Content>
                                        <Card.Description>
                                            <Button size="small" floated="right" color="red">Delete</Button>
                                            {image.description}
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        {formatDateTime(image.uploadedDateTime)}
                                    </Card.Content>
                                </Card>
                            )
                        }
                    </Card.Group>
                    <Segment floated="right" compact basic>
                        <Menu pagination floated="right">
                            {
                                Array(this.state.pagination.pagesTotal).fill().map((_, i) => {
                                    if (this.state.pagination.current === i) {
                                        return <Menu.Item key={i} active>{i + 1}</Menu.Item>
                                    } else {
                                        return <Link key={i} className="item" to={"/admin/images?page=" + i}>{i + 1}</Link>
                                    }
                                })
                            }
                        </Menu>
                    </Segment>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Images";
    }

    _onChange(event) {

    }
}