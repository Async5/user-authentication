import express from 'express';
import * as controllers from '../controllers/users.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, authorize('admin'), controllers.getUsers);
router.get('/me', auth, controllers.getMe);
router.post('/register', controllers.registerUser);
router.post('/login', controllers.loginUser);
router.get('/logout', auth, controllers.logout);
router.delete('/:id', auth, authorize('admin'), controllers.deleteUser);
router.put('/', auth, controllers.updateDetails);
router.put('/password', auth, controllers.changePassword);
//
export default router;
