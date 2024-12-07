import { getError } from "../errors/error.mjs";
import MongoConnection from "../mongo/MongoConnection.mjs"
import bcrypt from 'bcrypt';

export default class AccountsService {
    #accounts
    #connection
    constructor(connection_str, db_name) {
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection('accounts');
    }

    async insertAccount(account) {
        const accountDB = await this.#accounts.findOne({ _id: account.username });
        if (accountDB) {
            throw getError(400, `account for ${account.username} already exists`);
        }
        const toInsertAccount = this.#toAccountDB(account);
        const result = await this.#accounts.insertOne(toInsertAccount);
        if (result.insertedId == account.username) {
            return toInsertAccount;
        }
    }

    async updatePassword({ username, newPassword }) {
        const accountUpdated = await this.#accounts.findOneAndUpdate(
            { _id: username },
            { $set: { hashPassword: bcrypt.hashSync(newPassword, 10) } },
            { returnDocument: "after" });
        if (!accountUpdated) {
            throw getError(404, `account ${username} not found`);
        }
        return accountUpdated;
    }

    async getAccount(username) {
        const account = await this.#accounts.findOne({ _id: username });
        if (!account) {
            throw getError(404, `account ${username} not found`);
        }
        return account;
    }

    async deleteAccount(username) {
        const account = await this.getAccount(username);
        await this.#accounts.deleteOne({ _id: username });
        return account;
    }

    async setRole({ username, role }) {
        const validRoles = ['USER', 'PREMIUM_USER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw getError(400, 'Invalid role');
        }

        const account = await this.getAccount(username);
        account.role = role;
        await this.#accounts.updateOne({ _id: username }, { $set: { role } });

        return { username, role };
    }

    static authenticateSetRole(username, password) {
        const setRoleUsername = process.env.SET_ROLE_USERNAME;
        const setRolePassword = process.env.SET_ROLE_PASSWORD;

        if (username !== setRoleUsername || password !== setRolePassword) {
            throw getError(401, 'Unauthorized');
        }
    }

    #toAccountDB(account) {
        const accountDB = {};
        accountDB._id = account.username;
        accountDB.email = account.email;
        accountDB.hashPassword = bcrypt.hashSync(account.password, 10);
        accountDB.role = 'USER';
        return accountDB;
    }
}
