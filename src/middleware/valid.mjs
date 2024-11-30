export default function valid(req, res, next) {
    if (req._body) {
        if (!req.validated) {
            throw { code: 400, text: "no validation" };
        }
        if (req.error_message) {
            throw { code: 400, text: req.error_message };
        }
    }
    next();
}
