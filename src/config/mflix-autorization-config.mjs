import { getError } from "../errors/error.mjs"
const TIME_WINDOW_MILLIS = 60000;
const LIMIT_REQUESTS_PER_TIME_WINDOW = 2;
const roles = {
    USER: userAuthorizationFunction,
    PREMIUM_USER: async (accountsService, username) => Promise.resolve(true),
    ADMIN: async(accountsService, username) => {throw getError(403, '')}
};
async function userAuthorizationFunction(accountsService, username) {
    //one user cannot send several requests simultaneously 
    const currentTime  = new Date().getTime();
   let {timestamp, counter} = await accountsService.getTimestampCounter(username);
    if (timestamp && (currentTime - timestamp) < TIME_WINDOW_MILLIS) {
        if (counter == LIMIT_REQUESTS_PER_TIME_WINDOW) {
            throw getError(403, 'exceeded limit for role USER, upgrade account')
        } else {
            counter++;
        }
    } else {
        timestamp = currentTime;
        counter = 0;
    }
    return await accountsService.setTimestampCounter(username, {timestamp, counter});
}
export default roles;