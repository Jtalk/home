import React, {useState} from "react";
import {Button, Form, Icon, Modal} from "semantic-ui-react";
import {useForm} from "../admin/common/use-form";
import _ from "lodash";
import {Updating} from "../data/reduce/global/enums";
import {useHistory, useLocation} from "react-router";
import {ErrorMessage} from "../form/form-message";
import {Login, login, useLoginError, useLoginHandler, useLoginStatus} from "../data/reduce/authentication";
import {useLoadedStateChange} from "../utils/state-change";
import {execAsync} from "../utils/async";

const EMPTY_FORM = () => ({login: '', password: ''});

export const LoginModal = function ({enabled, onClose}) {

    let history = useHistory();
    let location = useLocation();
    let errorMessage = useLoginError();
    let loginStatus = useLoginStatus();
    let justLoggedIn = useLoadedStateChange(loginStatus, {
        from: Login.LOGGING_IN, to: Login.LOGGED_IN
    });

    let submitLogin = useLoginHandler();
    if (justLoggedIn) {
        console.debug("Login complete, closing modal");
        onClose();
        execAsync(() => history.push(location));
    }

    return <LoginModalStateless {...{enabled, onClose, submitLogin, loginStatus, errorMessage}}/>
};

export const LoginModalStateless = function ({enabled, onClose, loginStatus, errorMessage, submitLogin}) {

    let [error, setError] = useState({});
    let {updater, onSubmit, submitting, data, edited} = useForm({
        init: EMPTY_FORM(), updateStatus: asUpdateStatus(loginStatus)
    });

    errorMessage = errorMessage || ((error.login || error.password) && "Invalid field");

    let submit = form => {
        let errors = checkError(form, "login", "password");
        if (!_.isEmpty(errors)) {
            setError(errors);
        } else {
            submitLogin(form);
        }
    };
    let cleanAndClose = function (e) {
        updater.reloaded(EMPTY_FORM());
        onClose(e);
    };

    return <Modal closeIcon basic={false} open={enabled} onClose={cleanAndClose}>
        <Modal.Header>Login</Modal.Header>
        <Modal.Content>
            <Form loading={submitting} error={!!errorMessage} onSubmit={onSubmit(submit)}>
                <Form.Input label="Login" autoComplete="username" value={data.login} onChange={updater.change("login")}
                            error={error.login}/>
                <Form.Input label="Password" type="password" autoComplete="current-password" value={data.password}
                            onChange={updater.change("password")} error={error.password}/>
                <ErrorMessage message={errorMessage}/>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button primary disabled={!edited} onClick={onSubmit(submit)}>Login &nbsp; <Icon name="sign in"/></Button>
            <Button color="red" onClick={cleanAndClose}>Cancel</Button>
        </Modal.Actions>
    </Modal>
};

function checkError(form, ...fields) {
    _.chain(fields)
        .filter(f => !form[f])
        .zipObject(true)
        .value();
}

function asUpdateStatus(loginStatus) {
    switch (loginStatus) {
        case Login.LOGGED_IN:
            return Updating.UPDATED;
        case Login.ERROR:
            return Updating.ERROR;
        case Login.LOGGING_IN:
            return Updating.UPDATING;
        default:
            return undefined;
    }
}