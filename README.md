# EduCollab Platform

![EduCollab](https://img.shields.io/badge/EduCollab-Learning%20Platform-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6)

## 📋 Visão Geral

EduCollab é uma plataforma moderna de aprendizado colaborativo que oferece um sistema completo de gestão educacional. A plataforma suporta múltiplos tipos de usuários (estudantes, tutores e administradores) com funcionalidades específicas para cada perfil.

### 🎯 Funcionalidades Principais

- **Gestão de Cursos**: Criação, edição e gerenciamento completo de cursos
- **Sistema de Notas Colaborativas**: Criação e compartilhamento de materiais de estudo
- **Fórum de Discussão**: Interação entre estudantes e professores com sistema de votação
- **Dashboard Interativo**: Visualização de métricas e progresso em tempo real
- **Sistema de Presença**: Controle de frequência com calendário integrado
- **Gestão de Usuários**: Controle completo de perfis e permissões
- **Progresso do Estudante**: Acompanhamento detalhado do desempenho acadêmico

## 🚀 Instalação Local

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/educollab-platform.git
cd educollab-platform
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

```bash
# Configure o PostgreSQL
createdb educollab_db

# Configure as variáveis de ambiente
cp .env.example .env
```

### 4. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/educollab_db
PGHOST=localhost
PGPORT=5432
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGDATABASE=educollab_db

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# SendGrid (opcional para reset de senha)
SENDGRID_API_KEY=sua_api_key_sendgrid

# Ambiente
NODE_ENV=development
```

### 5. Execute as Migrações

```bash
npm run db:push
```

### 6. Popule o Banco com Dados Iniciais

```bash
npm run seed
```

### 7. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

### 👤 Credenciais de Teste

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`

**Professor:**
- Usuário: `fabricio`
- Senha: `123456`

**Estudante:**
- Usuário: `axelaluno`
- Senha: `123456`

## 🌐 Deploy Online

### Deploy no Replit

1. **Importe o projeto no Replit**:
   - Acesse [replit.com](https://replit.com)
   - Clique em "Create Repl" → "Import from GitHub"
   - Cole a URL do repositório

2. **Configure as variáveis de ambiente**:
   - No painel lateral, acesse "Secrets"
   - Adicione todas as variáveis do arquivo `.env`

3. **Execute o deploy**:
   ```bash
   npm run build
   npm start
   ```

### Deploy no Heroku

```bash
# Instale o Heroku CLI
heroku create educollab-app

# Configure o banco PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configure as variáveis de ambiente
heroku config:set JWT_SECRET=seu_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy no Vercel

```bash
# Instale o Vercel CLI
npm i -g vercel

# Configure o projeto
vercel

# Deploy
vercel --prod
```

## 📊 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build           # Build para produção
npm start               # Inicia servidor de produção

# Banco de dados
npm run db:push         # Aplica mudanças no schema
npm run db:studio       # Interface visual do banco
npm run seed            # Popula banco com dados iniciais

# Utilitários
npm run type-check      # Verificação de tipos TypeScript
npm run lint            # Análise de código
```

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 18 com TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query para gerenciamento de estado
- Wouter para roteamento
- Recharts para visualizações

**Backend:**
- Node.js + Express.js
- TypeScript
- Drizzle ORM
- JWT para autenticação
- Multer para upload de arquivos

**Banco de Dados:**
- PostgreSQL
- Neon Database (produção)

### Estrutura do Projeto

```
educollab-platform/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários e configurações
├── server/                # Backend Express
│   ├── index.ts          # Ponto de entrada
│   ├── routes.ts         # Definição das rotas
│   ├── storage.ts        # Camada de dados
│   └── db.ts             # Configuração do banco
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema do banco de dados
├── docs/                 # Documentação técnica
└── uploads/              # Arquivos enviados pelos usuários
```

## 🔧 Configuração de Desenvolvimento

### Requisitos do Sistema

- **Node.js**: Versão 18 ou superior
- **PostgreSQL**: Versão 13 ou superior
- **Memória RAM**: Mínimo 4GB recomendado
- **Espaço em disco**: 2GB livres

### Configuração do IDE

**VS Code (Recomendado):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@educollab.com
- 💬 Discord: [EduCollab Community](https://discord.gg/educollab)
- 📚 Wiki: [Documentação Completa](docs/)

## 🎯 Roadmap

- [ ] Integração com Google Classroom
- [ ] App Mobile (React Native)
- [ ] Sistema de Certificados
- [ ] IA para Recomendações Personalizadas
- [ ] Integração com Zoom/Teams
- [ ] Sistema de Gamificação

---

**EduCollab Platform** - Transformando a educação através da tecnologia 🚀