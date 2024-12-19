import mongoose, { Model, Document, Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export class GenericRepository<T extends Document> {
  protected collection: Model<T>;

  constructor(collectionName: string, schema: Schema) {
    this.collection = mongoose.model<T>(collectionName, schema);
  }

  async doc(id: string): Promise<T | null> {
    try {
      return await this.collection.findById(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async docs(skip: number, limit: number): Promise<T[]> {
    try {
      return await this.collection.find().skip(skip).limit(limit).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async add(options: Partial<T>): Promise<T> {
    try {
      const modelObj = new this.collection(options);
      return await modelObj.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(_id: string, options: Partial<T>): Promise<T | null> {
    try {
      return await this.collection.findByIdAndUpdate(
        _id,
        { $set: options },
        { new: true } 
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(_id: string): Promise<T | null> {
    try {
      return await this.collection.findByIdAndDelete(_id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async search(search: string, fields: string[]): Promise<T[]> {
    try {
      const searchQuery = {
        $or: fields.map((field) => ({
          [field]: new RegExp(search, 'i'), 
        })),
      };
  
      // Ensure the search query is of type FilterQuery<T> (for better type safety)
      const filterQuery: Record<string, any> = searchQuery;
  
      // Perform the search query with lean() to get plain objects
      const result = await this.collection.find(filterQuery).lean().exec();
  
      // Return the result, which is now a plain object array of type T[]
      return result as T[]; // Type assertion to T[]
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
