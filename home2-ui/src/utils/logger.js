import {Map} from "immutable";

export function reduxLoggerOpts() {
    return {
        stateTransformer: state => Map(state).toJS(),
        actionTransformer: action => Map(action).toJS(),
    }
}
