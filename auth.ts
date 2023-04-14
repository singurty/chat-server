import mongoose from 'mongoose';
import { hashSync, compareSync} from 'bcryptjs';

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
    console.log("password", user.password)
    await user.save();
}

async function SignIn(username: string, password: string) {
    const user: IUser = await User.findOne({ username: username });

    if (!user) {
        throw new Error('Invalid username or password');
    }

    const passwordHash = hashSync(password);
    if (compareSync(password, user.password)) {
        return user;
    } else {
        throw new Error('Invalid username or password');
    }
}

export { SignUp, SignIn };