
export function action(action) {
    return {
        type: action
    }
}

export function newState(action, newData) {
    return {
        type: action,
        data: newData
    }
}

export function error(action, errorMsg) {
    return {
        type: action,
        errorMessage: errorMsg
    }
}
