
export function ifMount(target, closure) {
    if (!target._asyncIsUnmount) {
        closure();
    }
}

export function execAsync(f) {
    setTimeout(f, 0);
}