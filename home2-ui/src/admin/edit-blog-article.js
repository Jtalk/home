import React from "react";
import {Button, Dropdown, Form, Grid, Segment, TextArea} from "semantic-ui-react";
import {ErrorMessage, formStateClass, SuccessMessage} from "../form/form-message";
import {DateInput, TimeInput} from "semantic-ui-calendar-react";

export default class EditBlogArticle extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            article: {
                id: "blog-entry-1",
                title: "Blog Entry 1",
                href: "/blog/article/blog-entry-1",
                editHref: "/admin/blog/article/blog-entry-1",
                tags: ["Java", "React"],
                content: "[h1]Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1]" +
                    " [p]Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium," +
                    " totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae" +
                    " dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit," +
                    " sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                comments: [],
                published: true,
                createTime: new Date(2017, 11, 15, 12, 30)
            },
            knownTags: [
                {key: "CSS", text: "CSS", value: "CSS"},
                {key: "React", text: "React", value: "React"},
                {key: "Java", text: "Java", value: "Java"},
                {key: "Scala", text: "Scala", value: "Scala"}
            ]
        }
    }

    render() {
        return <Grid centered>
            <Grid.Column width={13}>
                <Segment raised>
                    <h2>Edit Blog Post</h2>
                    {/*We can have onChange here to avoid adjusting individual fields*/}
                    <Form className={formStateClass(this.state.executed, this.state.errorMessage)}>
                        <Grid centered>
                            <Grid.Row>
                                <Grid.Column width={12}>
                                    <Form.Input label="Title" placeholder="Title" value={this.state.article.title}/>
                                    {/*Cannot be "new" for navigational reasons*/}
                                    <Form.Input label="Short Title" placeholder="For navigation" value={this.state.article.id}/>
                                    <Form.Field>
                                        <Form.Checkbox toggle label="Published" checked={this.state.article.published}/>
                                    </Form.Field>
                                    <Form.Group>
                                        <Form.Field>
                                            <label>Creation Date</label>
                                            <DateInput placeholder="Creation Date"
                                                       value={this._toDateString(this.state.article.createTime)}
                                                       iconPosition="left"
                                                       onChange={this._onChange}/>
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Creation Time</label>
                                            <TimeInput placeholder="Creation Time"
                                                       value={this._toTimeString(this.state.article.createTime)}
                                                       iconPosition="left"
                                                       onChange={this._onChange}/>
                                        </Form.Field>
                                    </Form.Group>
                                    {/*There was a JS function on this field, onClick*/}
                                    <Form.Field>
                                        <label>Tags</label>
                                        <Dropdown fluid multiple selection options={this.state.knownTags} value={this.state.article.tags}/>
                                    </Form.Field>
                                    <SuccessMessage message="Changes successfully saved"/>
                                    <ErrorMessage message={this.state.errorMessage}/>
                                </Grid.Column>
                                <Grid.Column verticalAlign="middle" width={4}>
                                    <Button.Group>
                                        <Button primary>Save</Button>
                                        <Button.Or/>
                                        <Button secondary>Cancel</Button>
                                    </Button.Group>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <Form.Field>
                                        <TextArea autoHeight label="Content" value={this.state.article.content}/>
                                    </Form.Field>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                </Segment>
            </Grid.Column>
        </Grid>
    }

    componentDidMount() {
        document.title = this.props.ownerName + ": Edit Blog Article";
    }

    _onChange(event) {

    }

    _onCh(event, value) {
        console.log(value);
    }

    _confirmAndDelete(event) {

    }

    _toDateString(date) {
        return date.toLocaleDateString();
    }

    _toTimeString(date) {
        return date.toLocaleTimeString();
    }

    _toTimeZone(date) {
        return "GMT"
    }
}