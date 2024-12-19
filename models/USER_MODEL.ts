import mongoose from "mongoose";
import { IUser } from "../types";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
       
    },
    password: {
        type: String,
        required: true
    },
    address:{
        street:{
            type : String
        },
        barangay: { 
            type: String
         },
        city: {
             type: String
         },
        municipality: { 
            type: String 
        },
        province: { 
            type: String 
        },
        postalCode: {
             type: String 
        }
    },
     lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
},{timestamps: true})

const User = mongoose.model<IUser>('User', userSchema)
export default  User