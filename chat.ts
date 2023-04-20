import mongoose from 'mongoose';
import { IUser } from './auth';

interface IMessage extends mongoose.Document {
    user: IUser,
    message: string,
    createdAt: Date
}

interface IChannel extends mongoose.Document {
    name: string,
    messages: IMessage[],
    users: IUser[],
}

const messageSchema = new mongoose.Schema<IMessage>({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const channelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true, unique: true },
    messages: [{ type: mongoose.Types.ObjectId, ref: 'Message', required: true}],
    users: [{ type: mongoose.Types.ObjectId, ref: 'User', required: true }]
});

const Message: mongoose.Model<IMessage> = mongoose.model('Message', messageSchema);
const Channel: mongoose.Model<IChannel> = mongoose.model('Channel', channelSchema);

async function CreateChannel(name: string, users: IUser[]): Promise<IChannel> {
    const channel: IChannel = new Channel({
        name: name,
        users: users,
        messages: []
    });
    await channel.save();
    return channel;
}

async function GetChannelsForUser(user: IUser): Promise<IChannel[]> {
    const channels: IChannel[] = await Channel.find({ users: user });
    return channels;
}

async function SendMessage(channel: IChannel, user: IUser, message: string): Promise<IMessage> {
    const msg: IMessage = new Message({
        user: user,
        message: message
    });
    channel.messages.push(msg);
    await channel.save();
    return msg;
}

export { IMessage, IChannel, Message, Channel, CreateChannel, GetChannelsForUser, SendMessage };