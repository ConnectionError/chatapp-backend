import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    data: String,
    name: String,
    timestamp: String,
    received: Boolean
});

export default mongoose.model('message', messageSchema);