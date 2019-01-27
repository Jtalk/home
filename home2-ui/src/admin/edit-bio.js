import React from "react";
import {Button, Divider, Form, Grid, Image, Input, Message, Segment, TextArea} from "semantic-ui-react";

export default class EditBio extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            owner: {
                photoUrl: "/images/avatar.png",
                name: "Vasya Pupkin",
                nickname: "VPupkin",
                description: "Very cool guy",
                email: "vasya@example.com",
                bio: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                    " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                    " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                    " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                    " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam" +
                    " est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius" +
                    " modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima" +
                    " veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea" +
                    " commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil" +
                    " molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?[/p]"
            },
            defaultOwner: {
                photoUrl: "/images/avatar.png"
            },
            success: undefined,
            errorMessage: undefined
        }
    }

    render() {
        let owner = this.state.owner ? this.state.owner : this.state.defaultOwner;
        return <Grid centered>
            <Grid.Column width={11}>
                <Segment raised>
                    <h2>Edit bio</h2>
                    <Form className={this._formClass()}>
                        <Divider/>
                        <Grid stackable>
                            <Grid.Row>
                                <Grid.Column width={11}>
                                    <Form.Field>
                                        <label>Owner name</label>
                                        <input placeholder="Name" value={owner.name} onChange={this._onChange}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Owner nickname</label>
                                        <input placeholder="Nickname" value={owner.nickname} onChange={this._onChange}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Owner E-Mail</label>
                                        <input placeholder="E-Mail" value={owner.email} onChange={this._onChange}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Owner short bio</label>
                                        <input placeholder="Short bio" value={owner.description} onChange={this._onChange}/>
                                    </Form.Field>
                                    <Message success>
                                        Changes successfully saved
                                    </Message>
                                    <Message error>
                                        <Message.Header>Error:</Message.Header>
                                        {this.state.errorMessage}
                                    </Message>
                                </Grid.Column>
                                <Grid.Column width={5}>
                                    <Form.Field>
                                        <label>Photo</label>
                                        <div className="image">
                                            <Image src={owner.photoUrl} alt="Owner photo"/>
                                        </div>
                                        <Input type="file" accept="image/jpeg, image/png, image/svg, image/gif"/>
                                    </Form.Field>
                                    <Button primary type="submit">Save</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <TextArea autoHeight label="Bio" placeholder="Something about me..." value={owner.bio}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    _formClass() {
        if (!!this.state.errorMessage) {
            return "error";
        } else if (this.state.success) {
            return "success";
        } else {
            return "";
        }
    }

    _onChange(event) {

    }
}