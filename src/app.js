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

server.post("/messages", async (req, res)=>{
    const {to, text, type} = req.body;
    const from = req.headers.user;

    const participanteExiste = await participantesCollection.findOne({name: from})

    const validation = msgSchema.validate({to, text, type}, {abortEarly: false});

    if(validation.error){
        const erros = validation.error.details.map((detail) => detail.message);

        res.status(422).send(erros);
        return;
    }

    if(!participanteExiste){
        res.sendStatus(422);
        return;
    }

    try{
        await msgCollection.insertOne({
            from: from,
            to,
            text,
            type,
            time: horario
        });
        res.sendStatus(201);
    }catch(err){
        res.status(500).send(err);
    }
});

server.get("/messages", async (req, res) => {
    const from = req.headers.user;
    const {limit: limiteMsg} = req.query;

    const listarMsg = await msgCollection.find({$or: [{from: from}, {to: {$in: [from, "Todos"]}},{type: "message"}],}).toArray();

    if(limiteMsg){
        const numeroLimite = Number(limiteMsg);

        if(numeroLimite <= 0 || isNaN(numeroLimite) ){
                res.sendStatus(422);
                return;
        }
        res.send(listarMsg.slice(-numeroLimite).reverse());
        return;
    }

    try{
        res.send(listarMsg.reverse());
    }catch(err){
        res.status(500).send(err);
    }
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});
