import express from 'express';
import joi from 'joi';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';

const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db = null;
const promise = mongoClient.connect().then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE);
  });

promise.catch((err) => {
    console.log('Erro ao conectar o banco de dados!')

});

server.post('/participants', async (req, res) => {
    const participantes = req.body;

    const participantesObj = joi.object({
        name: joi.string().required()
      });

    const { error } = participantesObj.validate(participantes);

    if(error) {
       return res.sendStatus(422);
    }
    
    try {
        
        const participantesExiste = await db.collection("participantes").findOne({ name: participantes.name }) 
        if(participantesExiste){
           return res.sendStatus(409); 
        }
    
        await db.collection('participants').insertOne({ name: participantes.name, lastStatus: Date.now()});
        
        await db.collection('messages').insertOne({
            from: participantes.name, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format('HH:MM:SS'),
            })

        res.sendStatus(201);
    
    } catch (error) {
        console.error({ error });
        res.Status(500).send("Falha no cadastro");
    }
   

});

server.get('/participants', async (req, res) => {
    try {
       const participantesExists = await db.collection('participants').find();
        res.send(participants);
    } catch (error) {
        console.error({ error });
        res.Status(500).send("Falha ao tentar pegar todos os participantes");
    }
})



server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});
