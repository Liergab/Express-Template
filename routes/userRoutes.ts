import express from 'express'
import config from '../config/endpoint';
const userRouter = express.Router()
import { UserController } from '../controllers/userController';

const userController = new UserController();

// Define routes
userRouter.post(config.USER_ENDPOINT.CREATE_USER, userController.createUser.bind(userController)); 
userRouter.get(config.USER_ENDPOINT.GET_ALL_USERS, userController.getAllUsers.bind(userController)); 
userRouter.get(config.USER_ENDPOINT.SEARCH_USERS, userController.searchUsers.bind(userController));
userRouter.get(config.USER_ENDPOINT.GET_USER_BY_ID, userController.getUserById.bind(userController)); 
userRouter.put(config.USER_ENDPOINT.UPDATE_USER_BY_ID, userController.updateUser.bind(userController)); 
userRouter.delete(config.USER_ENDPOINT.DELETE_USER_BY_ID, userController.deleteUser.bind(userController)); 
userRouter.post(config.USER_ENDPOINT.LOGIN_USER, userController.login.bind(userController));


export default userRouter