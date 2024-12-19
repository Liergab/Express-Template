import { hashPassword } from '../config/bcrypt';
import { UserRepository } from '../repository/userRepository';
import { IUser } from '../types/index';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(); 
  }

  // Create a new user
  async createUser(userData: Partial<IUser>): Promise<IUser> {
      const userExists = await this.userRepository.getEmail(userData.email!)
      if(userExists) {
        throw new Error('User already exists')
      }
      userData.password =  await hashPassword(userData.password!);
      return await this.userRepository.add(userData); 
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
  async getAllUsers(): Promise<IUser[]> {
    try {
      return await this.userRepository.docs(); 
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
  async searchUsers(criteria: Record<string, any>): Promise<IUser[]> {
    try {
      return await this.userRepository.search(criteria); 
    } catch (error) {
      console.error(error);
      throw new Error('Failed to search users');
    }
  }
}
