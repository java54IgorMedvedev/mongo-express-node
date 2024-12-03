import express from 'express';
import asyncHandler from 'express-async-handler';
import AccountsService from '../service/AccountsService.mjs';
import { validateBody } from '../middleware/validation.mjs';
import schemas from '../validation-schemas/schemas.mjs';

const accountsService = new AccountsService(process.env.MONGO_URI, process.env.DB_NAME);
export const accounts_route = express.Router();

accounts_route.post("/account", asyncHandler(async (req, res) => {
    const result = await accountsService.insertAccount(req.body);
    res.status(201).json(result);
}));

accounts_route.put("/account/password", validateBody(schemas), asyncHandler(async (req, res) => {
    const result = await accountsService.updatePassword(req.body);
    res.status(200).json(result);
}));

accounts_route.get("/account/:username", asyncHandler(async (req, res) => {
    const result = await accountsService.getAccount(req.params.username);
    res.status(200).json(result);
}));

accounts_route.delete("/account/:username", asyncHandler(async (req, res) => {
    const result = await accountsService.deleteAccount(req.params.username);
    res.status(200).json(result);
}));
