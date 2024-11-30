export function getError(code, message) {
    return {
        error: {
            code,
            message
        }
    };
}
