export default function validate(schemas) {
    return (req, res, next) => {
        const schema = schemas[req.path]?.[req.method];
        if (schema) {
            const { error } = schema.validate(req.body);
            req.validated = true;
            req.error_message = error?.details?.[0]?.message || null;
        } else {
            req.validated = false;
        }
        next();
    };
}
