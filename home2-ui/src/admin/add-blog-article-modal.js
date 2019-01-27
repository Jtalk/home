import React from "react";
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import {ErrorMessage, formStateClass} from "../form/form-message";

export default class AddBlogArticleModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            success: undefined,
            errorMessage: undefined
        };
    }


    render() {
        return <Modal size="small" onClose={this._clear} trigger={<Button><Icon name="plus"/>Add entry</Button>}>
            <Icon name="close"/>
            <Modal.Header>Add entry</Modal.Header>
            <Modal.Content>
                <Form className={formStateClass(this.state.success, this.state.errorMessage)}>
                    <Form.Field>
                        <label>Blog entry title</label>
                        <input placeholder="Title" onChange={this._onChange}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Short name for navigation</label>
                        <input placeholder="(letters, numbers, dashes)" onChange={this._onChange}/>
                    </Form.Field>
                    <ErrorMessage errorMessage={this.state.errorMessage}/>
                    <Button positive onClick={this._createBlogArticle}>
                        Create
                    </Button>
                </Form>
            </Modal.Content>
        </Modal>
    }

    _onChange(event) {

    }

    _createBlogArticle(event) {

    }

    _clear() {

    }
}