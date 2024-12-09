import AccountsService from "../service/AccountsService.mjs";

export const accountsService = new AccountsService(process.env.MONGO_URI, process.env.DB_NAME);