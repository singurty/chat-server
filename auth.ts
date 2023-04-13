import mongoose from 'mongoose';
import { hashSync } from 'bcryptjs';

interface IUser extends mongoose.Document {
    username: string;
    password: string;
    createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: { type: Date, default: Date.now },
});

const User: mongoose.Model<IUser> = mongoose.model('User', userSchema);

async function SignUp(username: string, password: string) {
    const user: IUser = new User({
        username: username,
        password: hashSync(password)
    });
    user.save();
}

export { SignUp };