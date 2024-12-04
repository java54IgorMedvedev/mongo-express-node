import express from 'express';
import { AccountService } from '../services/accounts-service.mjs';

export const accounts_route = express.Router();

accounts_route.put('/update-password/:id', async (req, res, next) => {
  try {
    const updatedAccount = await AccountService.updatePassword(req.params.id, req.body.password);
    res.status(200).json(updatedAccount);
  } catch (err) {
    next(err);
  }
});

accounts_route.delete('/:id', async (req, res, next) => {
  try {
    const deletedAccount = await AccountService.deleteAccount(req.params.id);
    res.status(200).json(deletedAccount);
  } catch (err) {
    next(err);
  }
});
