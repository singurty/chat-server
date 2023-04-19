import mongoose from 'mongoose';
import { IUser } from './auth';

interface Message extends mongoose.Document {
    user: IUser,
    message: string,
    createdAt: Date
}

interface Channel extends mongoose.Document {
    name: string,
    messages: Message[],
    users: IUser[],
}

const messageSchema = new mongoose.Schema<Message>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const channelSchema = new mongoose.Schema<Channel>({
    name: { type: String, required: true, unique: true },
    messages: [messageSchema],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
});

const Message: mongoose.Model<Message> = mongoose.model('Message', messageSchema);
const Channel: mongoose.Model<Channel> = mongoose.model('Channel', channelSchema);

async function CreateChannel(name: string, users: IUser[]): Promise<Channel> {
    const channel: Channel = new Channel({
        name: name,
        users: users
    });
    await channel.save();
    return channel;
}

async function GetChannelsForUser(user: IUser): Promise<Channel[]> {
    const channels: Channel[] = await Channel.find({ users: user });
    return channels;
}

export { Message, Channel, CreateChannel, GetChannelsForUser };