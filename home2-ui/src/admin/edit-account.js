import {Divider, Form, Grid, Segment} from "semantic-ui-react";
import {Titled} from "react-titled";
import {Updating} from "../data/reduce/global/enums";
import {ErrorMessage, SuccessMessage} from "../form/form-message";
import React, {useState} from "react";
import {EXISTING_PASSWORD_MISMATCH, usePasswordChanger, useUsername} from "../data/reduce/authentication";
import {useForm} from "./common/use-form";
import {useFormErrors} from "./common/use-errors";

const PASSWORD_FORM = () => ({
    password: {}
});

export const EditAccount = function () {

    let username = useUsername();
    let changer = usePasswordChanger();
    let errors = useFormErrors();
    let [updating, setUpdating] = useState();
    let {onSubmit, data, updater, canSubmit, submitting} = useForm({
        init: PASSWORD_FORM(), updateStatus: updating, secure: true
    });

    let changePassword = async data => {
        setUpdating(Updating.UPDATING);
        let updateResult = Updating.ERROR;
        try {
            if (!data.password.new) {
                return errors.report("No password was provided")("password", "new");
            }
            if (!passwordConfirmed(data.password.new, data.password.confirmation)) {
                return errors.report("The new password and its confirmation do not match")
                    .for("password", "new")
                    .for("password", "confirmation");
            } else {
                await changer(data.password);
                updateResult = Updating.UPDATED;
            }
        } catch (e) {
            if (e.message === EXISTING_PASSWORD_MISMATCH) {
                return errors.report(e.message)("password", "current");
            }
            return errors.report(e.message);
        } finally {
            setUpdating(updateResult);
        }
    }

    return <EditAccountStateless onSubmit={onSubmit(changePassword)} {...{
        updating, username, errors, updater, data, canSubmit, submitting
    }}/>
};

export const EditAccountStateless = function ({onSubmit, updating, username, errors, updater, data, canSubmit, submitting}) {
    let update = (...path) => {
        return (...data) => {
            errors.reset(...path);
            updater.change(...path)(...data);
        }
    }
    return <Grid centered>
        <Titled title={t => "Edit Account | " + t}/>
        <Grid.Column width={11}>
            <Segment raised>
                <h2>Edit Account</h2>
                <Form onSubmit={onSubmit}
                      success={updating === Updating.UPDATED}
                      error={updating === Updating.ERROR || errors.hasErrors()}>
                    <Divider/>
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                {/*Helping password managers determine which account to edit*/}
                                <input readOnly autoComplete="username" value={username} style={{display: "none"}}/>
                                <Form.Input label="Old password"
                                            placeholder="Current password"
                                            autoComplete="current-password"
                                            type="password"
                                            value={data.password.current || ''}
                                            error={errors.errorFor("password", "current")}
                                            onChange={update("password", "current")}/>
                                <Form.Input label="New password"
                                            placeholder="New password"
                                            autoComplete="new-password"
                                            type="password"
                                            value={data.password.new || ''}
                                            error={errors.errorFor("password", "new")}
                                            onChange={update("password", "new")}/>
                                <Form.Input label="Confirm password"
                                            placeholder="Re-type the password"
                                            autoComplete="new-password"
                                            type="password"
                                            value={data.password.confirmation || ''}
                                            error={errors.errorFor("password", "confirmation")}
                                            onChange={update("password", "confirmation")}/>
                                <SuccessMessage message="Password successfully changed"/>
                                <ErrorMessage message={errors.message}/>
                                <Form.Button primary floated="right"
                                             disabled={!canSubmit || !!errors.hasErrors()}
                                             loading={submitting || updating === Updating.UPDATING}
                                             content="Apply"/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
            </Segment>
        </Grid.Column>
    </Grid>
};

function passwordConfirmed(password, confirmation) {
    return password && password === confirmation;
}