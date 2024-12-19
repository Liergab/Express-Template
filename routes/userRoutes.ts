import express from 'express'
const userRouter = express.Router()
import { UserController } from '../controllers/userController';

const userController = new UserController();

// Define routes
userRouter.post('/users', userController.createUser.bind(userController)); 
userRouter.get('/users', userController.getAllUsers.bind(userController)); 
userRouter.get('/users/search', userController.searchUsers.bind(userController));
userRouter.get('/users/:id', userController.getUserById.bind(userController)); 
userRouter.put('/users/:id', userController.updateUser.bind(userController)); 
userRouter.delete('/users/:id', userController.deleteUser.bind(userController)); 


export default userRouter