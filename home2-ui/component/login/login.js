import React, {useCallback, useMemo} from "react";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";
import {useForm} from "../admin/common/use-form";
import {useFormErrors} from "../admin/common/use-errors";
import {ErrorMessage} from "../message/error-message";
import {Login} from "../../data/hooks/authentication/login-state";
import {useLoginError, useLoginHandler, useLoginStatus} from "../../data/hooks/authentication";
import LazyIcon from "../lazy-icon";

const EMPTY_FORM = () => ({login: '', password: ''});

export default function LoginModal({enabled, onClose}) {

    let errorMessage = useLoginError();
    let loginStatus = useLoginStatus();

    let submitLogin = useLoginHandler();
    let closingSubmit = useCallback(async (form) => {
        let result = await submitLogin(form);
        if (result) {
            onClose();
        }
        return result;
    }, [submitLogin, onClose]);

    return <LoginModalStateless submitLogin={closingSubmit} {...{enabled, onClose, loginStatus, errorMessage}}/>
};

export const LoginModalStateless = function ({enabled, onClose, errorMessage, loginStatus, submitLogin}) {

    let emptyForm = useMemo(EMPTY_FORM, []);
    let {updater, onSubmit, data, canSubmit} = useForm({
        init: emptyForm, secure: true
    });
    let errors = useFormErrors(emptyForm);

    errorMessage = errors.message || errorMessage;

    let submit = async form => {
        errors.validate(form.login, "Empty login field")("login");
        errors.validate(form.password, "Empty password field")("password");
        if (errors.hasErrors()) {
            console.debug("The form contains errors, no need to submit:", errors.message);
            return;
        }
        await submitLogin(form);
    };
    let cleanAndClose = function (e) {
        updater.reload(EMPTY_FORM());
        onClose(e);
    };

    return <Modal closeIcon basic={false} open={enabled} onClose={cleanAndClose}>
        <Modal.Header>Login</Modal.Header>
        <Modal.Content>
            <Form loading={loginStatus === Login.LOGGING_IN} error={loginStatus === Login.ERROR || errors.hasErrors()}>
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
            <Button primary disabled={!canSubmit} onClick={onSubmit(submit)}>Login &nbsp; <LazyIcon
                name="sign in"/></Button>
            <Button color="red" onClick={cleanAndClose}>Cancel</Button>
        </Modal.Actions>
    </Modal>
};
