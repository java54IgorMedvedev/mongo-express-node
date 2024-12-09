import roles from "../config/mflix-autorization-config.mjs"
import { getError } from "../errors/error.mjs"
export default function mflix_authorization (accountsService) {
    return async (req, res, next) => {
        if(!await roles[req.role]?.(accountsService, req.user)) {
            throw getError(500, "authorizing state error")
        }
        next();
    }
}