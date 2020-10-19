import {Divider, Form, Grid, Segment} from "semantic-ui-react";
import {Updating} from "../../data/reduce/global/enums";
import React, {useMemo, useState} from "react";
import {useForm} from "../../component/admin/common/use-form";
import {useFormErrors} from "../../component/admin/common/use-errors";
import {reportError} from "../../utils/error-reporting";
import {OwnerTitled} from "../../component/about/owner-titled";
import {SuccessMessage} from "../../component/message/success-message";
import {ErrorMessage} from "../../component/message/error-message";
import {usePasswordChanger, useUsername} from "../../data/reduce/authentication/hooks";
import {EXISTING_PASSWORD_MISMATCH} from "../../data/reduce/authentication/messages";

const PASSWORD_FORM = () => ({
    password: {}
});

export default function EditAccount() {

    let username = useUsername();
    let changer = usePasswordChanger();
    let [updating, setUpdating] = useState();
    let emptyPasswordForm = useMemo(PASSWORD_FORM, []);
    let {onSubmit, data, updater, canSubmit, submitting} = useForm({
        init: emptyPasswordForm, secure: true
    });
    let errors = useFormErrors(emptyPasswordForm);

    let changePassword = async data => {
        setUpdating(Updating.UPDATING);
        let updateResult = Updating.ERROR;
        try {
            errors.reset("server-response");
            errors.validate(data.password.new, "No password was provided")("password", "new");
            errors.validate(passwordConfirmed(data.password.new, data.password.confirmation),
                "The new password and its confirmation do not match")
                    .for("password", "new")
                    .for("password", "confirmation");
            if (!errors.hasErrors()) {
                await changer(data.password);
                updateResult = Updating.UPDATED;
            }
        } catch (e) {
            reportError(e);
            if (e.message === EXISTING_PASSWORD_MISMATCH) {
                return errors.report(e.message)("password", "current");
            }
            return errors.report(e.message)("server-response");
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
        <OwnerTitled title={"Edit Account"}/>
        <Grid.Column width={11}>
            <Segment raised>
                <h2>Edit Account</h2>
                <Form onSubmit={onSubmit}
                      success={updating === Updating.UPDATED}
                      error={errors.hasErrors()}>
                    <Divider/>
                    <Grid stackable>
                        <Grid.Row>
                            <Grid.Column width={16}>
                                {/*Helping password managers determine which account to edit*/}
                                <input readOnly autoComplete="username" value={username || ''} style={{display: "none"}}/>
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
                                             disabled={!canSubmit}
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
