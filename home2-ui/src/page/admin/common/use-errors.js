import {useEffect, useState} from "react";
import _ from "lodash";

export function useFormErrors(errorsFor) {
    let [errors, setErrors] = useState();
    useEffect(() => {
        let updateErrors = (update) => {
            setErrors({...update});
        }
        setErrors(new FormErrors(updateErrors));
    }, [errorsFor]);
    return errors || new FormErrors();
}

export class FormErrors {
    constructor(onUpdate) {
        this.store = {};
        this.knownPaths = new Set();
        this.onUpdate = onUpdate || (() => {});
    }
    get message() {
        return _.chain([...this.knownPaths])
            .map(p => p.split("|"))
            .map(p => this.errorFor(...p))
            .filter(v => !!v)
            .uniq()
            .join(", ")
            .value();
    }
    hasErrors = (...path) => {
        return !!this.errorFor(...path);
    }
    errorFor = (...path) => {
        if (path.length) {
            return _.get(this.store, path);
        } else {
            return this.message;
        }
    }
    report = message => {
        let result = (...path) => {
            _.set(this.store, path, message);
            this.knownPaths.add(path.join("|"));
            this.onUpdate(this);
            return result;
        };
        result.for = result;
        return result;
    }
    validate = (predicate, message) => {
        if (!predicate) {
            return this.report(message);
        } else {
            this.reset.for = this.reset;
            return this.reset;
        }
    }
    reset = (...path) => {
        _.set(this.store, path, undefined);
        this.knownPaths.delete(path.join("|"));
        this.onUpdate(this);
        return this.reset;
    }
}