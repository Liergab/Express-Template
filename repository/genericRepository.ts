import mongoose, { Model, Document, Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export class GenericRepository<T extends Document> {
  private collection: Model<T>;

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

  async docs(): Promise<T[]> {
    try {
      return await this.collection.find();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getEmail(email:string):Promise<T | null>{
    return await this.collection.findOne({email}).exec()
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

  async search(criteria: Record<string, any>): Promise<T[]> {
    try {
      return await this.collection.find(criteria);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}
