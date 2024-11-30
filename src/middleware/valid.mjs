export default function valid(req, res, next) {
    if (!req.validated) {
        res.status(400).json({ error: { code: 400, message: req.error_message } });
    } else {
        next();
    }
}
