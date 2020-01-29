import {useState} from "react";
import _ from "lodash";
import {Updating} from "../../data/reduce/global/enums";

const FILES_PATH = "__files";

export function useForm({init, updateStatus}) {
    const [updating, setUpdating] = useState();
    const [data, setData] = useState(init || {});
    const [edited, setEdited] = useState(false);
    if (updating && updateStatus === Updating.UPDATED) {
        setUpdating(false);
        setData(init);
    } else if (updating && updateStatus === Updating.ERROR) {
        setUpdating(false);
    }
    const onSubmit = (onSubmit) => {
        return (e) => {
            if (!edited) {
                throw Error("The form is being submitted without any preceding edits, likely a submit button enable/disable screwup");
            }
            console.debug("Submitting form", data);
            let update = Object.assign({}, data);
            delete update[FILES_PATH];
            if (onSubmit(update, data[FILES_PATH] || {})) {
                console.debug("Form submit success");
                setUpdating(true);
            } else {
                console.debug("Could not submit form");
            }
        };
    };
    const updater = new Updater(data, setData, setEdited);
    return {onSubmit, data, updater, edited};
}

class Updater {

    constructor(data, setData, setEdited) {
        this.data = data;
        this.setData = setData;
        this.setEdited = setEdited;
    }

    change = (...path) => {
        return (e, {value}) => {
            let oldValue = _.get(this.data, path);
            if (_.isEqual(oldValue, value)) {
                console.debug(`Not changing value, '${value}' is the same as '${oldValue}' at path:`, path);
            } else {
                console.debug(`Changing value, '${value}' is different from '${oldValue}' at path:`, path);
                let newData = _.cloneDeep(this.data);
                _.set(newData, path, value);
                this.setData(newData);
                this.setEdited(true);
            }
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