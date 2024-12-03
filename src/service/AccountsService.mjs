import { getError } from "../errors/error.mjs";
import MongoConnection from "../mongo/MongoConnection.mjs"
import bcrypt from 'bcrypt';
export default class AccountsService {
  #accounts;
  #connection;

  constructor(connection_str, db_name) {
      this.#connection = new MongoConnection(connection_str, db_name);
      this.#accounts = this.#connection.getCollection('accounts');
  }

  async insertAccount(account) {
      const accountDB = await this.#accounts.findOne({ _id: account.username });
      if (accountDB) {
          throw getError(400, `Account for ${account.username} already exists`);
      }
      const toInsertAccount = this.#toAccountDB(account);
      const result = await this.#accounts.insertOne(toInsertAccount);
      if (result.insertedId === account.username) {
          return toInsertAccount;
      }
  }

  async updatePassword({ username, newPassword }) {
      const accountDB = await this.#accounts.findOne({ _id: username });
      if (!accountDB) {
          throw getError(404, `Account ${username} not found`);
      }
      const hashPassword = bcrypt.hashSync(newPassword, 10);
      const result = await this.#accounts.updateOne(
          { _id: username },
          { $set: { hashPassword } }
      );
      if (result.matchedCount === 0) {
          throw getError(500, `Failed to update password for ${username}`);
      }
      return { username, message: "Password updated successfully" };
  }

  async getAccount(username) {
      const accountDB = await this.#accounts.findOne({ _id: username });
      if (!accountDB) {
          throw getError(404, `Account ${username} not found`);
      }
      return accountDB;
  }

  async deleteAccount(username) {
      const accountDB = await this.#accounts.findOne({ _id: username });
      if (!accountDB) {
          throw getError(404, `Account ${username} not found`);
      }
      const result = await this.#accounts.deleteOne({ _id: username });
      if (result.deletedCount === 0) {
          throw getError(500, `Failed to delete account ${username}`);
      }
      return { username, message: "Account deleted successfully" };
  }

  #toAccountDB(account) {
      return {
          _id: account.username,
          email: account.email,
          hashPassword: bcrypt.hashSync(account.password, 10),
      };
  }
}
