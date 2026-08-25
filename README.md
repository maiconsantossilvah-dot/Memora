# Memora

Aplicação pessoal para organizar anotações em cards, com imagens, tags, datas, status e uma agenda mensal. Os dados ficam no Cloud Firestore e as imagens no Firebase Storage. A configuração web do Firebase é informada pela própria interface e salva apenas no `localStorage` do navegador.

## Instalação e desenvolvimento

Requisitos: Node.js 22.13 ou superior e npm.

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal. Para validar a versão de produção:

```bash
npm run build
npm run start
```

## Configurar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Build → Firestore Database**, crie um banco do Cloud Firestore.
3. Em **Build → Storage**, habilite o Firebase Storage.
4. Em **Configurações do projeto → Seus apps**, registre um aplicativo Web.
5. Copie os campos do objeto `firebaseConfig`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` e `appId`.
6. Abra o Memora, clique em **Configurar Firebase**, preencha os campos e use **Testar conexão**.
7. Clique em **Salvar**. A configuração persistirá neste navegador.

O SDK Web não usa service account, chave privada ou Firebase Admin SDK. A configuração web identifica o projeto, mas não protege os dados.

## Estrutura de dados

As anotações ficam em uma única coleção:

```text
notes/{noteId}
  title: string
  description: string
  images: [{ url, storagePath }]
  tags: string[]
  date: string             // YYYY-MM-DD
  time?: string            // HH:mm
  addToCalendar: boolean
  status: pending | completed | archived
  createdAt: Timestamp
  updatedAt: Timestamp
  userId?: string          // reservado para autenticação
```

As imagens são enviadas para `notes/{noteId}/{arquivo}` no Storage. A agenda não duplica documentos: ela filtra as notas em que `addToCalendar` é `true`. As tags também são calculadas a partir das próprias notas.

## Segurança e Rules

Os arquivos [`firestore.rules`](./firestore.rules) e [`storage.rules`](./storage.rules) trazem uma base segura para a futura versão autenticada: cada nota pertence a `request.auth.uid`, e uploads são limitados a imagens de até 10 MB.

Como esta primeira versão não implementa login, essas regras seguras bloquearão gravações. Para desenvolvimento local, use um projeto Firebase descartável e, se necessário, regras temporárias e restritas no tempo. **Não publique a aplicação com acesso anônimo aberto** e nunca use `allow read, write: if true` em produção.

Antes de disponibilizar publicamente:

1. habilite Firebase Authentication;
2. obtenha o usuário atual em uma camada de autenticação;
3. preencha `userId` ao criar notas;
4. filtre consultas por `userId`;
5. publique as Rules fornecidas e teste-as com o Emulator Suite.

## Organização do código

```text
app/                         entrada e estilos globais
src/components/              formulário, modais, cards e navegação
src/pages/                   Notas, Agenda e Tags
src/services/firebase.ts     inicialização dinâmica
src/services/notes.service.ts operações do Firestore
src/services/storage.service.ts uploads e exclusões do Storage
src/services/calendar/       projeção da agenda interna
src/types/                   tipos compartilhados
```

As chamadas do Firebase ficam fora dos componentes. O formulário de nota é compartilhado entre criação e edição. A camada `services/calendar` é independente da interface para permitir uma futura integração com Google Calendar sem misturar OAuth com a agenda interna.

## Fluxo de teste

1. Abra a aplicação sem configuração e confirme o estado inicial.
2. Configure e teste a conexão com um projeto Firebase de desenvolvimento.
3. Crie uma nota com título, descrição, várias tags, data, horário e imagens.
4. Ative **Adicionar à agenda**, salve e confirme a nota em **Anotações** e **Agenda**.
5. Pesquise pelo título, descrição e tag; teste status, data, agenda e ordenação.
6. Abra a nota, edite campos e imagens, marque como concluída e arquive.
7. Em **Tags**, abra uma tag e confirme o filtro aplicado em Anotações.
8. Exclua a nota e confirme a remoção das imagens no Storage.
9. Recarregue a página e confirme que configuração, tema e dados persistem.

## Build

```bash
npm run build
```

O projeto usa React, TypeScript, Vite/Vinext, CSS próprio, Firebase Web SDK e date-fns. Não há dependências de estado global nem bibliotecas visuais adicionais.
