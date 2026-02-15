import { comparePassword, hashPassword } from "../config/bcrypt";
import UserRepository from "../repository/userRepository";
import { IUser } from "../types/index";
import generateToken from "../util/generateToken";
import parseFilterString from "../util/parseFilterString";

class UserService {
  // Create a new user
  async createUser(
    userData: Partial<IUser>
  ): Promise<{ token: string; user: Omit<IUser, 'password'> }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (userExists) {
      throw new Error("User already exists");
    }
    userData.password = await hashPassword(userData.password!);
    const newUser = await UserRepository.add(userData);
    const token = await generateToken(newUser.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = newUser; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
  }

  async login(
    userData: Partial<IUser>
  ): Promise<{ token: string; user: Omit<IUser, 'password'> }> {
    const userExists = await UserRepository.getEmail(userData.email!);
    if (!userExists) {
      throw new Error("User does not exist");
    }
    const isValidPassword = await comparePassword(
      userData.password!,
      userExists.password!
    );
    if (!isValidPassword) {
      throw new Error("Invalid Password");
    }
    const token = await generateToken(userExists.id); // Prisma uses 'id' not '_id'
    const { password: _, ...userWithoutPassword } = userExists; // Prisma returns plain objects
    return { user: userWithoutPassword, token };
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.doc(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to retrieve user");
    }
  }

  async getUsers(params: any): Promise<{ users: IUser[]; pagination: any }> {
    if (!params) {
      throw new Error("Invalid parameters for getting all users");
    }

    try {
      const dbParams: any = { where: {} };

      // Handle include for relations (e.g., include: { posts: true })
      if (params.include && typeof params.include === 'object') {
        dbParams.include = params.include;
      }

      // Handle query array (Prisma uses 'in' instead of '$in')
      if (
        params.queryArray &&
        params.queryArray.length > 0 &&
        params.queryArrayType &&
        params.queryArrayType.length > 0
      ) {
        const queryArray = Array.isArray(params.queryArray)
          ? params.queryArray
          : [params.queryArray];
        const queryArrayType = Array.isArray(params.queryArrayType)
          ? params.queryArrayType
          : [params.queryArrayType];

        queryArrayType.forEach((type: string | number) => {
          const trimmedType = String(type).trim();
          dbParams.where[trimmedType] = { in: queryArray };
        });
      }

      // Handle simple filters (e.g., "isVerified:true,name:John" or "address.city:Manila")
      if (params.filter && typeof params.filter === 'string') {
        const parsedFilter = parseFilterString(params.filter);
        if (parsedFilter) {
          dbParams.where = { ...dbParams.where, ...parsedFilter };
        }
      }

      // Handle sorting
      if (params.sort) {
        dbParams.orderBy = params.sort;
      }

      // Handle field selection (Prisma uses 'select')
      // Note: select and include cannot be used together in Prisma
      if (params.select && !dbParams.include) {
        const selectFields = Array.isArray(params.select)
          ? params.select.filter((f: string) => f && f.trim())
          : [params.select].filter((f: string) => f && f.trim());

        if (selectFields.length > 0) {
          dbParams.select = {};
          selectFields.forEach((field: string) => {
            dbParams.select[field] = true;
          });
        }
      }

      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      dbParams.skip = (page - 1) * limit;
      dbParams.take = limit;

      const [users, totalItems] = await Promise.all([
        UserRepository.docs(dbParams),
        UserRepository.count(dbParams.where),
      ]);

      const totalPages = Math.ceil(totalItems / limit);
      const pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { users, pagination };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }

  // Update user details by ID
  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      return await UserRepository.update(id, userData);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<IUser | null> {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete user");
    }
  }

  // Search users with specific criteria
  async searchUsers(search: string): Promise<IUser[]> {
    try {
      const fields = ["name", "email"]; 
      return await UserRepository.search(search, fields);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to search users");
    }
  }

  async getUser(id: string, params: any): Promise<IUser | null> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const dbParams: any = {};

      // Handle field selection (Prisma uses 'select')
      if (params.select) {
        const selectFields = Array.isArray(params.select)
          ? params.select.filter((f: string) => f && f.trim())
          : [params.select].filter((f: string) => f && f.trim());

        if (selectFields.length > 0) {
          dbParams.select = {};
          selectFields.forEach((field: string) => {
            dbParams.select[field] = true;
          });
        }
      }

      return await UserRepository.doc(id, dbParams);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(String(error));
      }
    }
  }
}

export default new UserService();
