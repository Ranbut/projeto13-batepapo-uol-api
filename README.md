# Projeto 13 - Batepapo Uol Api
Front-end do projeto n° 13 do curso de desenvolvimento fullstack da Driven 

# Descrição

Seu segundo projeto *back-end* será a construção da API do Bate-papo UOL!

## 🚨 **Atenção**

Fizemos algumas alterações no front-end original do Bate-papo UOL. Portanto, **não teste usando a sua própria aplicação.** Em vez disso, utilize a aplicação que fornecemos a seguir:

# Driventime

- Nomeie a pasta do seu projeto com: `projeto13-batepapo-uol-api`

# Requisitos

- Geral
    - [x]  A porta utilizada pelo seu servidor deve ser a `5000`
    - [x]  Versionamento usando Git é obrigatório, crie um **repositório público** no seu perfil do GitHub
    - [x]  Faça commits a cada funcionalidade implementada
    - [x]  Utilize dotenv
- Armazenamento de dados
    - [x]  Para persistir os dados (participantes e mensagens), utilize coleções do Mongo com a biblioteca `mongodb`
    - [x]  O formato de um **participante** deve ser:
        
        ```jsx
        {name: 'João', lastStatus: 12313123} // O conteúdo do lastStatus será explicado nos próximos requisitos
        ```
        
    - [x]  O formato de uma **mensagem** deve ser:
        
        ```jsx
        {from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}
        ```
        
    - [x]  Se conecte ao banco usando sempre a variável de ambiente `DATABASE_URL`. Caso deixe o valor fixo ou use outra variável, a avaliação falhará
        
        Ex.: 
        
        **Certo**
        
        ```jsx
        const mongoClient = new MongoClient(process.env.DATABASE_URL);
        ```
        
        **Errado**
        
        ```jsx
        const mongoClient = new MongoClient(process.env.MONGO_URL);
        ```
        
        ```jsx
        const mongoClient = new MongoClient('mongodb://admin:admin@localhost:27017/mydb');
        ```
        
    - [x]  Não adicione nenhum nome customizado para o banco de dados. Use o nome dado pela connection string
        
        **Certo**
        
        ```jsx
        const db = mongoClient.db();
        ```
        
        **Errado**
        
        ```jsx
        const db = mongoClient.db("minhadb");
        ```
        

***ATENÇÃO! VOCE DEVE USAR VARIÁVEIS DE AMBIENTE NA CONNECTION STRING!! OBRIGATORIO***

- **POST** `/participants`
    - [x]  Deve receber (pelo body do request), um parâmetro **name**, contendo o nome do participante a ser cadastrado:
        
        ```jsx
        {
            name: "João"
        }
        ```
        
    - [x]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
        - [x]  **name** deve ser string não vazio
    - [x]  As validações deverão ser feitas com a biblioteca `joi`
    - [x]  Impeça o cadastro de um nome que já está sendo utilizado (caso exista, retornar **status 409**)
    - [x]  Salvar o participante na coleção de nome `participants` com o MongoDB, no formato:
        
        ```jsx
        {name: 'xxx', lastStatus: Date.now()}
        ```
        
        **Dica**: este `Date.now()` gera um **timestamp**, que é o número de milissegundos passados desde 01/01/1970 00:00:00 até o exato momento. É bem útil pra fazer contas matemáticas com data e será útil nos próximos requisitos (para expulsar usuários inativos do chat)
        
        <aside>
        ⚠️ O nome da coleção deve ser necessariamente `participants`, caso contrário a avaliação falhará
        
        </aside>
        
    - [x]  Salvar com o MongoDB uma mensagem no formato:
        
        ```jsx
        {from: 'xxx', to: 'Todos', text: 'entra na sala...', type: 'status', time: 'HH:MM:SS'}
        ```
        
        Para gerar o horário nesse formato, (utilize a biblioteca `dayjs`)
        
    - [x]  Por fim, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.
    
- **GET** `/participants`
    - [x]  Retornar a lista de todos os participantes
- **POST** `/messages`
    - [x]  Deve receber (pelo body da request), os parâmetros `to`, `text` e `type`:
        
        ```jsx
        {
            to: "Maria",
            text: "oi sumida rs",
            type: "private_message"
        }
        ```
        
    - [x]  Já o `from` da mensagem, ou seja, o remetente, **não será enviado pelo body**. Será enviado pelo front através de um **header** na requisição, chamado `User`
    - [x]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
        - [x]  **to** e **text** devem ser strings não vazias
        - [x]  **type** só pode ser `message` ou `private_message`
        - [x]  **from** deve ser um participante existente na lista de participantes
    - [x]  As validações deverão ser feitas com a biblioteca `joi`, com exceção da validação de um participante existente na lista de participantes (use as funções do MongoDB para isso)
    - [x]  Ao salvar essa mensagem, deve ser acrescentado o atributo **time**, contendo a hora atual no formato HH:MM:SS (utilize a biblioteca `dayjs`)
    - [x]  Por fim, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status
    - [x]  Salve a mensagem na collection de nome `messages` com o formato proposto na seção de armazenamento de dados
        
        <aside>
        ⚠️ O nome da coleção deve ser necessariamente `messages`, caso contrário a avaliação falhará
        
        </aside>
        
- **GET** `/messages`
    - [x]  Retornar as mensagens
    - [x]  Essa rota deve aceitar um parâmetro via **query string** (o que vem após a interrogação numa URL), indicando a quantidade de mensagens que gostaria de obter. Esse parâmetro deve se chamar `limit`. Ou seja, o request do front será feito pra URL:
        
        ```jsx
        http://localhost:4000/messages?limit=100
        ```
        
        - [x]  Caso não seja informado um `limit`, todas as mensagens devem ser retornadas. Caso tenha sido fornecido um `limit`, por exemplo 100, somente as últimas 100 mensagens mais recentes devem ser retornadas
    - [x]  Além disso, o back-end só deve entregar as mensagens que aquele usuário poderia ver. Ou seja, deve entregar todas as mensagens públicas, todas as mensagens privadas enviadas para ele e por ele. Para isso, o front envia um header `User` para identificar quem está fazendo a requisição
- **POST** `/status`
    - [x]  Deve receber por um **header** na requisição, chamado `User`, contendo o nome do participante a ser atualizado
    - [x]  Caso este participante não conste na lista de participantes, deve ser retornado um **status 404.** Nenhuma mensagem precisa ser retornada além do status.
    - [x]  Atualizar o atributo **lastStatus** do participante informado para o timestamp atual, utilizando `Date.now()`
    - [x]  Por fim, retornar **status 200**
- Remoção automática de usuários inativos
    - [ ]  A cada 15 segundos, remova da lista de participantes os participantes que possuam um **lastStatus** de mais de 10 segundos atrás
        
        **Dica:** você pode usar `setInterval` no arquivo do seu servidor
        
    - [ ]  Para cada participante removido, salve uma nova mensagem em memória, no formato:
        
        ```jsx
        {from: 'xxx', to: 'Todos', text: 'sai da sala...', type: 'status', time: 'HH:MM:SS'}
        ```
        

# Bônus (opcional)

- Sanitização de dados
    - [ ]  Ao salvar um participante, sanitizar o parâmetro **name** (remover possíveis tags HTML por segurança)
        
        **Dica**: pesquise por uma lib chamada **string-strip-html**
        
    - [ ]  Ao salvar uma mensagem, sanitizar todos os parâmetros (remover possíveis tags HTML por segurança)
    - [ ]  Além disso, remova possíveis espaços em branco no início e fim das strings (pesquise por **trim**)
- **DELETE** `/messages/ID_DA_MENSAGEM`
    - [ ]  Deve receber por um **header** na requisição, chamado `User`, contendo o nome do participante que deseja deletar a mensagem
    - [ ]  Deve receber por **path params** o ID da mensagem a ser deletada
    - [ ]  Deve buscar na coleção `messages` se alguma mensagem existe com o id recebido, e, caso não exista, retornar **status 404**
    - [ ]  Caso o usuário do header não seja o dono da mensagem, retornar **status 401**
    - [ ]  Remover a mensagem da coleção `messages`
- **PUT** `/messages/ID_DA_MENSAGEM`
    - [ ]  Deve receber (pelo body da request), os parâmetros `to`, `text` e `type`:
        
        ```jsx
        {
            to: "Maria",
            text: "oi sumida rs",
            type: "private_message"
        }
        ```
        
    - [ ]  Já o `from` da mensagem, ou seja, o remetente, **não será enviado pelo body**. Será enviado pelo front através de um **header** na requisição, chamado `User`
    - [ ]  Deve receber por um **header** na requisição, chamado `User`, contendo o nome do participante que deseja atualizar a mensagem
    - [ ]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
        - [ ]  **to** e **text** devem ser strings não vazias
        - [ ]  **type** só pode ser `message` ou `private_message`
        - [ ]  **from** deve ser um participante existente na lista de participantes
    - [ ]  As validações deverão ser feitas com a biblioteca `joi`, com exceção da validação de um participante existente na lista de participantes (use as funções do MongoDB para isso)
    - [ ]  Deve receber por **path params** o ID da mensagem a ser atualizada
    - [ ]  Deve buscar na coleção `messages` se alguma mensagem existe com o id recebido, e, caso não exista, retornar **status 404**
    - [ ]  Caso o usuário do header não seja o dono da mensagem, retornar **status 401**
    - [ ]  Atualizar a mensagem da coleção `messages` com os dados do body
