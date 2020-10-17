
export const checkTruthy = function(value, message) {
    if (!value) {
        throw new Error(message);
    }
};