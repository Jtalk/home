
import React from "react";
import {useState} from "react";
import {Form} from "semantic-ui-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"
import _ from "lodash";

// We hard code this format. JS Date Locale API is sooo broken...
const FORMAT = "DD MMM YYYY, HH:mm:ss";
dayjs.extend(customParseFormat);

export const DatePicker = function ({value, onChange}) {
    let [state, setState] = useState(null);
    let [renderedValue, setRenderedValue] = useState(value);
    let [valid, setValid] = useState(true);
    if (!_.isEqual(value, renderedValue)) {
        setRenderedValue(value);
        setState(asString(value));
        setValid(true);
    }
    if (state === null) {
        setState(asString(value));
    }
    let reportValue = (e) => {
        let parsed = tryParse(state);
        setValid(!!parsed);
        if (parsed) {
            onChange(e, {value: parsed});
        }
    };
    let onValueChange = (e, {value}) => {
        setState(value);
        let parsed = tryParse(value);
        setValid(!!parsed);
    };
    return <Form.Input error={!valid}
                       value={state || ''}
                       onChange={onValueChange} onBlur={reportValue}/>
};

function tryParse(string) {
    let result = dayjs(string, FORMAT);
    return result.isValid() && result.toDate();
}

function asString(date) {
    return dayjs(date).format(FORMAT);
}