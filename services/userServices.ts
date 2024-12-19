import { hashPassword } from '../config/bcrypt';
import { UserRepository } from '../repository/userRepository';
import { IUser } from '../types/index';
import generateToken from '../util/generateToken';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(); 
  }

  // Create a new user
  async createUser(userData: Partial<IUser>): Promise<{token:string, user:IUser}> {
      const userExists = await this.userRepository.getEmail(userData.email!)
      if(userExists) {
        throw new Error('User already exists')
      }
      userData.password =  await hashPassword(userData.password!);
      const newUser =  await this.userRepository.add(userData); 
      const token = await generateToken(newUser._id)
      return {user:newUser, token}
  }

  // Get a user by ID
  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await this.userRepository.doc(id); 
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve user');
    }
  }

  // Get all users
  async getAllUsers(skip: number, limit: number): Promise<IUser[]> {
    try {
      return await this.userRepository.docs(skip, limit); 
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve users');
    }
  }

  // Update user details by ID
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await this.userRepository.update(id, userData); 
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update user');
    }
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<IUser | null> {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete user');
    }
  }

  // Search users with specific criteria
  async searchUsers(search: string): Promise<IUser[]> {
    try {
      const fields = ['name', 'email']; // Fields to search in the User model
      return await this.userRepository.search(search, fields);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search users');
    }
  }
}
