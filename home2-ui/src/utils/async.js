
export function markUnmount() {
    this._asyncIsUnmount = true;
}

export function ifMount(target, closure) {
    if (!target._asyncIsUnmount) {
        closure();
    }
}