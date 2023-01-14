import express from 'express';
import cors from 'cors';

const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;

server.post('/participants', (req, res) => {
    const participante = req.body;


});

server.get('/participants', (req, res) => {
    
});

server.post('/messages', (req, res) => {

});

server.get('/messages', (req, res) => {
    
});

server.post('/status', (req, res) => {
    
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});
