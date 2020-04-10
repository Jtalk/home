import {useRef} from "react";
import _ from "lodash";

export function useFormErrors() {
    let errors = useRef(new FormErrors());
    return errors.current;
}

class FormErrors {
    constructor(base) {
        this.message = undefined;
        this.store = {};
    }
    hasErrors = (...path) => {
        return !!this.errorFor(path);
    }
    errorFor = (...path) => {
        if (path.length) {
            return !!_.get(this.store, path);
        } else {
            return !!this.message;
        }
    }
    report = message => {
        let result = (...path) => {
            this.message = message;
            _.set(this.store, path, message);
            return result;
        };
        result.for = result;
        return result;
    }
    reset = (...path) => {
        this.message = undefined;
        _.set(this.store, path, undefined);
    }
}