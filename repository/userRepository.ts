import { IUser } from '../types';
import User from '../models/USER_MODEL';
import { GenericRepository } from './genericRepository'; 

export class UserRepository extends GenericRepository<IUser> {
  constructor() {
    super('User', User.schema); 
  }
}