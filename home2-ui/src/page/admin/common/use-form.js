import {useCallback, useMemo, useState} from "react";
import _ from "lodash";
import {useDependentState} from "./state";

const FILES_PATH = "__files";

export function useForm({init, autoSubmit, secure} = {}) {
    const defaultValue = useMemo(() => ({}), []);
    const [edited, setEdited] = useState(false);
    const onReload = useCallback(() => setEdited(false), [setEdited]);
    const [data, setData] = useDependentState(init || defaultValue, onReload);
    const [submitting, setSubmitting] = useState(false);
    const submit = useCallback(async (onSubmit, update) => {
        console.debug("Submitting form", showSecurely(update, secure));
        let copy = {...update};
        delete copy[FILES_PATH];
        try {
            setSubmitting(true);
            let result = await onSubmit(copy, update[FILES_PATH] || {});
            console.debug("Form submit success");
            return result;
        } catch (e) {
            console.error("Form submit error", e);
        } finally {
            console.debug("Form submit complete");
            setSubmitting(false);
        }
    }, [secure, setSubmitting]);
    let emptyAutoSubmitter = () => {};
    let activeAutoSubmitter = useCallback((data) => submit(autoSubmit, data), [submit, autoSubmit]);
    let autoSubmitter = autoSubmit ? activeAutoSubmitter : emptyAutoSubmitter;
    let updateData = useCallback(update => {
        setData(update);
        setEdited(true);
    }, [setData, setEdited]);
    let updater = useMemo(
        () => new Updater(data, updateData, setData, autoSubmitter),
        [data, updateData, setData, autoSubmitter]);
    updater.secure = secure;

    const onSubmit = (onSubmit) => {
        return async () => {
            if (!edited) {
                throw Error("The form is being submitted without any preceding edits, likely a submit button enable/disable screwup");
            }
            return await submit(onSubmit, data);
        };
    };

    return {onSubmit, data, updater, edited, submitting, canSubmit: edited && !submitting};
}

class Updater {

    constructor(data, setData, resetData, autoSubmit) {
        this.data = data;
        this.setData = setData;
        this.resetData = resetData;
        this.autoSubmit = autoSubmit;
        this.secure = false;
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

    reload(newData) {
        console.debug("Reloading form data to", showSecurely(newData, this.secure));
        this.resetData(newData);
    }
}

function showSecurely(value, secure) {
    return secure ? "<<securely hidden>>" : value;
}