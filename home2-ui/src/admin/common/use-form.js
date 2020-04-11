import {useState} from "react";
import _ from "lodash";
import {Updating} from "../../data/reduce/global/enums";

const FILES_PATH = "__files";

export function useForm({init, updateStatus, autoSubmit, secure} = {}) {
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(init || {});
    const [edited, setEdited] = useState(false);
    if (submitting && updateStatus === Updating.UPDATED) {
        setSubmitting(false);
        setEdited(false);
        setData(init);
    } else if (submitting && updateStatus === Updating.ERROR) {
        setSubmitting(false);
    }
    const submit = async (onSubmit, update) => {
        console.debug("Submitting form", update);
        let copy = Object.assign({}, update);
        delete copy[FILES_PATH];
        setSubmitting(true);
        try {
            let result = await onSubmit(copy, update[FILES_PATH] || {});
            console.debug("Form submit success");
            return result;
        } catch (e) {
            console.debug("Form submit error", e);
            setSubmitting(false);
            throw e;
        }
    };
    const onSubmit = (onSubmit) => {
        return async (e) => {
            if (!edited) {
                throw Error("The form is being submitted without any preceding edits, likely a submit button enable/disable screwup");
            }
            return await submit(onSubmit, data);
        };
    };
    let autoSubmitter = () => {};
    if (autoSubmit) {
        autoSubmitter = (data) => submit(autoSubmit, data);
    }
    const updater = new Updater(data, setData, setEdited, autoSubmitter, secure);
    return {onSubmit, data, updater, edited, submitting, canSubmit: edited && !submitting};
}

class Updater {

    constructor(data, setData, setEdited, autoSubmit, secure) {
        this.data = data;
        this.setData = setData;
        this.setEdited = setEdited;
        this.autoSubmit = autoSubmit;
        this.secure = secure;
    }

    change = (...path) => {
        return (e, {value}) => {
            let oldValue = _.get(this.data, path);
            if (_.isEqual(oldValue, value)) {
                console.debug(`Not changing value at path:`, path, showSecurely(oldValue, this.secure), showSecurely(value, this.secure));
            } else {
                console.debug(`Changing value at path:`, path, showSecurely(oldValue, this.secure), showSecurely(value, this.secure));
                let newData = _.cloneDeep(this.data);
                _.set(newData, path, value);
                this.setData(newData);
                this.setEdited(true);
                this.autoSubmit(newData);
            }
        };
    };

    changeToggle = (...path) => {
        return (e, {checked, value, ...rest}) => {
            return this.change(path)(e, {value: checked, ...rest});
        }
    };

    reorder = (fromIndex, toIndex, ...path) => {
        return (e) => {
            let collection = _.get(this.data, path) || [];
            if (fromIndex < 0 || fromIndex >= collection.length) {
                throw Error(`Cannot move from an invalid index ${fromIndex}, collection ${collection.length}`);
            }
            if (toIndex < 0 || toIndex >= collection.length) {
                console.error(`Cannot move from ${fromIndex} to an invalid index ${toIndex}, collection ${collection.length}`);
                return;
            }
            let copy = [...collection];
            let item = copy[fromIndex];
            copy.splice(fromIndex, 1);
            copy.splice(toIndex, 0, item);
            this.change(path)(e, {value: copy});
        };
    };

    addItem = (item, ...path) => {
        return e => {
            let collection = _.get(this.data, path);
            let copy = [...collection, item];
            this.change(path)(e, {value: copy});
        };
    };

    changeItem = (index, ...path) => {
        return (e, {value}) => {
            let collection = _.get(this.data, path);
            if (index < 0 || index >= collection.length) {
                throw Error(`Cannot replace an item at invalid index ${index}, collection ${collection.length}`);
            }
            let copy = [...collection];
            copy.splice(index, 1, value);
            this.change(path)(e, {value: copy});
        };
    };

    removeItem = (index, ...path) => {
        return (e) => {
            let collection = _.get(this.data, path) || [];
            if (index < 0 || index >= collection.length) {
                throw Error(`Cannot remove item from an invalid index ${index}, collection ${collection.length}`);
            }
            let copy = [...collection];
            copy.splice(index, 1);
            this.change(path)(e, {value: copy});
        };
    };

    changeFile = (name) => {
        return (e) => {
            let file = e.target.files[0];
            console.debug(`File ${name} is selected for uploading`, file);
            return this.change(FILES_PATH, name)(e, {value: file});
        };
    };

    reloaded(newData) {
        if (!_.isEqual(this.data, newData)) {
            console.debug("Resetting the form state to", newData);
            this.setData(newData);
            this.setEdited(false);
        }
    }
}

function showSecurely(value, secure) {
    return secure ? "<<securely hidden>>" : value;
}