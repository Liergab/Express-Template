import { IUser } from '../types';
import { GenericRepository } from './genericRepository';

class UserRepository extends GenericRepository<IUser> {
  constructor() {
    super('user'); // Prisma model name (lowercase)
  }

  async getEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
}

export default new UserRepository();
