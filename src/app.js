import express from 'express';
import joi from 'joi';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;


const participantesSchema = joi.object({
    name: joi.string().required()
});

const msgSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private_message").required()
})

const mongoClient = new MongoClient(process.env.DATABASE_URL);

let db;

try{
    await mongoClient.connect()
    db = mongoClient.db();
    console.log("Banco de dados MongoDB conectado!");
}catch(err){
    console.log(`Erro ao conectar ao MongoDB: ${err}`);
};

const participantesCollection = db.collection("participants");
const msgCollection = db.collection("messages");

const horario = dayjs().locale("pt").format("HH:mm:ss");

server.post("/participants", async (req, res)=>{
    const {name} = req.body;

    const participanteExiste = await participantesCollection.findOne({name});

    const validacao = participantesSchema.validate({name}, { abortEarly: false });

    if(validacao.error){
        const erros = validacao.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    };

    if(participanteExiste){
        res.sendStatus(409);
        return;
    }

    try{
       await participantesCollection.insertOne({
        name,
        lastStatus: Date.now()
       });

       await msgCollection.insertOne({
        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: horario
       });

       res.sendStatus(201);
    }catch(err){
        res.status(500).send(err);
    }
});

server.get("/participants", async (req, res)=>{
    try{
        const participante = await participantesCollection.find().toArray();
        res.send(participante);
    }catch(err){
        res.status(500).send(err); 
    }
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});
