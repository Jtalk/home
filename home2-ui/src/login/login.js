import React from "react";
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import {useForm} from "../admin/common/use-form";
import _ from "lodash";
import {useHistory, useLocation} from "react-router";
import {ErrorMessage} from "../form/form-message";
import {useLoginError, useLoginHandler, useLoginStatus} from "../data/reduce/authentication";
import {useFormErrors} from "../admin/common/use-errors";

const EMPTY_FORM = () => ({login: '', password: ''});

export const LoginModal = function ({enabled, onClose}) {

    let history = useHistory();
    let location = useLocation();
    let errorMessage = useLoginError();
    let loginStatus = useLoginStatus();

    let submitLogin = useLoginHandler();
    let closingSubmit = async (form) => {
        let result = await submitLogin(form);
        if (result) {
            onClose();
            history.push(location);
        }
    }

    return <LoginModalStateless {...{enabled, onClose, submitLogin: closingSubmit, loginStatus, errorMessage}}/>
};

export const LoginModalStateless = function ({enabled, onClose, errorMessage, submitLogin}) {

    let errors = useFormErrors();
    let {updater, onSubmit, submitting, data, edited} = useForm({
        init: EMPTY_FORM(), secure: true, version: 1
    });

    errorMessage = errors.message || errorMessage;

    let submit = async form => {
        errors.reset("login");
        errors.reset("password");
        checkError(form, errors, "login", "password");
        if (!errors.hasErrors()) {
            await submitLogin(form);
        } else {
            throw Error("Form validation failed");
        }
    };
    let cleanAndClose = function (e) {
        updater.change("login")(null, {value: ""});
        updater.change("password")(null, {value: ""});
        onClose(e);
    };

    return <Modal closeIcon basic={false} open={enabled} onClose={cleanAndClose}>
        <Modal.Header>Login</Modal.Header>
        <Modal.Content>
            <Form loading={submitting} error={!!errorMessage || errors.hasErrors()} onSubmit={onSubmit(submit)}>
                <Form.Input label="Login"
                            autoComplete="username"
                            value={data.login || ""}
                            onChange={updater.change("login")}
                            error={errors.errorFor("login")}/>
                <Form.Input label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={data.password || ""}
                            onChange={updater.change("password")}
                            error={errors.errorFor("password")}/>
                <ErrorMessage message={errorMessage}/>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button primary disabled={!edited} onClick={onSubmit(submit)}>Login &nbsp; <Icon name="sign in"/></Button>
            <Button color="red" onClick={cleanAndClose}>Cancel</Button>
        </Modal.Actions>
    </Modal>
};

function checkError(form, errors, ...fields) {
    _.chain(fields)
        .filter(f => !form[f])
        .map(errors.report("Empty value"))
        .value();
}
