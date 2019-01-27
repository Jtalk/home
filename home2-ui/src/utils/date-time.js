

export function formatDateTime(date) {
    if (date instanceof Date) {
        return date.toLocaleString();
    } else {
        throw Error("Unsupported date-time type: " + date);
    }
}
