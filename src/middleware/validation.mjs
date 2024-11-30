export default function validate(schemas) {
    return (req, res, next) => {
        const schema = schemas[req.path]?.[req.method];
        if (schema) {
            const { error } = schema.validate(req.body);
            if (error) {
                req.validated = false;
                req.error_message = error.details[0]?.message || "Validation error";
                console.error('Validation failed:', req.error_message);
            } else {
                req.validated = true;
                req.error_message = null;
            }
        } else {
            req.validated = true;
            req.error_message = null;
        }
        next();
    };
}
