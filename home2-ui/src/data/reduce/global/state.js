import _ from "lodash";
import {fromJS} from "immutable";

export function updateState(currentState, update, orderingProp, idProp = "id") {
    console.debug("Data is", currentState.toJS(), update);
    _.forOwn(update, (value, key) => {
        let found = currentState.findIndex(v => v.get(idProp) === key);
        let immutableValue = fromJS(value);
        if (found === -1) {
            currentState = currentState.push(immutableValue);
        } else {
            currentState = currentState.splice(found, 1, immutableValue);
            if (currentState.get(found).get(orderingProp) !== update.order) {
                currentState = currentState.sortBy(v => v.get(orderingProp));
            }
        }
    });
    console.debug("New current state", currentState);
    return currentState;
}