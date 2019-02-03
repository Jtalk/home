

export function title(main, local) {
    if (main) {
        return `${main} | ${local}`
    } else {
        return local;
    }
}