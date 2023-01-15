import express from 'express';
import cors from 'cors';

const server = express();
server.use(express.json());
server.use(cors());

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta: ${PORT}`);
  console.log(`Use: http://localhost:${PORT}`);
});
