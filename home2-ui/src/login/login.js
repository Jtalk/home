import React from "react";
import {useState} from "react";
import {Button, Form, Modal} from "semantic-ui-react";
import {useForm} from "../admin/common/use-form";
import {useAjax} from "../context/ajax-context";
import {useDispatch} from "react-redux";
import _ from "lodash";
import {Updating} from "../data/reduce/global/enums";
import {useHistory, useLocation} from "react-router";
import {ErrorMessage} from "../form/form-message";
import {loggedIn} from "../data/reduce/authentication";

const EMPTY_FORM = () => ({login: '', password: ''});

export const LoginModal = function({enabled, onClose}) {

    let ajax = useAjax();
    let dispatch = useDispatch();
    let history = useHistory();
    let location = useLocation();

    let [updateStatus, setUpdateStatus] = useState();
    let [ajaxError, setAjaxError] = useState();
    let {updater, onSubmit, submitting, data, edited} = useForm({init: EMPTY_FORM(), updateStatus});
    let [error, setError] = useState({});

    let handleClose = e => {
        updater.reloaded(EMPTY_FORM());
        setAjaxError();
        setUpdateStatus();
        setError({});
        onClose(e);
    };
    let submit = async form => {
        let errors = checkError(form, "login", "password");
        if (!_.isEmpty(errors)) {
            setError(errors);
            return;
        }
        setUpdateStatus(Updating.UPDATING);
        try {
            let success = await ajax.authentication.login(form);
            if (!success) {
                setUpdateStatus(Updating.ERROR);
                setAjaxError("Invalid credentials");
                console.warn("Login failure: invalid credentials");
            } else {
                console.info("Login success");
                dispatch(loggedIn());
                onClose();
                history.push(location);
            }
        } catch (e) {
            console.error("Login failure", e);
            setUpdateStatus(Updating.ERROR);
            setAjaxError(e.message);
        }
    };

    return <Modal closeIcon basic={false} open={enabled} onClose={handleClose} >
        <Modal.Header>Login</Modal.Header>
        <Modal.Content>
            <Form loading={submitting} error={!!ajaxError}>
                <Form.Input label="Login" value={data.login} onChange={updater.change("login")} error={error.login}/>
                <Form.Input label="Password" value={data.password} onChange={updater.change("password")} error={error.password}/>
                <ErrorMessage message={ajaxError}/>
            </Form>
        </Modal.Content>
        <Modal.Actions>
            <Button primary disabled={!edited} onClick={onSubmit(submit)}>Login</Button>
            <Button color="red" onClick={handleClose}>Cancel</Button>
        </Modal.Actions>
    </Modal>
};

function checkError(form, ...fields) {
    _.chain(fields)
        .filter(f => !form[f])
        .zipObject(true)
        .value();
}