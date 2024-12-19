import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/userServices';
import mongoose from 'mongoose';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Create a user
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body; 
      const {user,token }= await this.userService.createUser(userData); 

      res.cookie('auth-token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV !== 'development', 
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        path: '/',
      })
      
      res.status(201).json({user, token}); 
    } catch (error:any) {
      if(error?.message === 'User already exists') {
        res.status(409)
      }
      next(error)
    }
  }

  // Get a user by ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {

   
    try {
      const userId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
         res.status(400)
         throw new Error('Invalid user ID format');
      }
      const user = await this.userService.getUserById(userId); 
      if (user) {
        res.status(200).json(user); 
      } else {
        res.status(404)
        throw new Error('User not found');
      }
    } catch (error) {
     next(error)

    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;  
      const limit = parseInt(req.query.limit as string) || 10;  
      const skip = (page - 1) * limit;
      const users = await this.userService.getAllUsers(skip, limit);

   
      const hasNextPage = users.length === limit;

      res.status(200).json({
        data: users,
        page: page,
        limit: limit,
        nextPage: hasNextPage ? page + 1 : null,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve users' });
    }
  }

  // Update a user by ID
  async updateUser(req: Request, res: Response,next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const userData = req.body; 
      const updatedUser = await this.userService.updateUser(userId, userData); 
      if (updatedUser) {
        res.status(200).json(updatedUser); 
      } else {
        res.status(404)
        throw new Error('User not found');
      }
    } catch (error:any) {
      next(error)
    }
  }

  
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const deletedUser = await this.userService.deleteUser(userId); 
      if (deletedUser) {
        res.status(200).json({ message: 'User deleted' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }

  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string;

      const users = await this.userService.searchUsers(search);
  
      res.status(200).json({ data: users });
    } catch (error) {
      res.status(500).json({ message: 'Failed to search users' });
    }
  }
}
