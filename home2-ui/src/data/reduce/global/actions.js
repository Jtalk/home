export function action(type, data) {
    return {
        type,
        data,
    }
}

export function error(type, errorMessage, ctx) {
    return {
        type,
        errorMessage,
        ctx
    }
}
