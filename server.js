import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';
const app = express();


const pusher = new Pusher({
    appId: "1122514",
    key: "a581d237771331c139a8",
    secret: "1ec32ecd36ebec4854b0",
    cluster: "ap2",
    useTLS: true
});

app.use(express.json());
app.use(cors());

const mongoURI = 'mongodb+srv://admin:admin@chatapp-backend.eejer.mongodb.net/chatappdb?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection('messages');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        if(change.operationType==='insert'){
            const msgDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', msgDetails);
        }else{
            console.log('Error triggering Pusher');
        }
    });
});

app.get('/', (req, res) => res.status(200).send('Hello world'));

app.get('/api/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data);
        }
    })
})

app.post('/api/messages', async (req, res) => {
    const dbMessage = req.body;
    await Messages.create(dbMessage, (err, data)=> {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

app.listen(PORT, () => console.log(`Server is up at port: ${PORT}`))