# lab07 — API (Node.js + TypeScript + Prisma/MongoDB)

API em Express + TypeScript usando **Prisma** com **MongoDB**.

## O que foi feito

Resolução dos apontamentos da review (PRs #1 e #2):

- **Prisma como ORM único** — os models Mongoose (`src/model/user.js` e `src/model/profile.js`)
  foram removidos e a dependência `mongodb` saiu do `package.json`.
- **Tudo em inglês** — `Usuario` → `User`, `PerfilConta` → `Profile`, `senhaHash` → `passwordHash`,
  `cpf` → `taxId`, `matricula` → `employeeId`, `cargo` → `jobTitle`, `departamento` → `department`,
  `telefone` → `phone`, `dataAdmissao` → `hireDate`, enum `gestor`/`funcionario` → `manager`/`employee`.
- **Modelagem completa** — `User` ganhou `name`, `phone`, `emailVerified`, `isActive`, `lastLoginAt`,
  `passwordChangedAt` e o fluxo de **reset de senha** (`resetPasswordToken` + `resetPasswordExpires`);
  `Profile` ficou com os dados de RH.
- **`.env` fora do Git** — removido do versionamento e criado o `.env.example`.
- **Prisma 6.x** — fixado em `6.19.0`, porque o **Prisma 7 não suporta MongoDB**.

## Modelo de dados

- **`User`** (coleção `users`) — identidade (`name`, `email`, `phone`), autenticação
  (`passwordHash`, `role`, `emailVerified`, `isActive`) e reset de senha.
- **`Profile`** (coleção `profiles`) — dados de RH (`taxId`, `employeeId`, `jobTitle`, `department`,
  `hireDate`, `photoUrl`), relação 1:1 com `User`.

## Como rodar

```bash
npm install            # o `prisma generate` roda junto (postinstall)
cp .env.example .env   # preencha DATABASE_URL e JWT_KEY
npm run db:push        # cria as coleções no MongoDB
npm run dev
```

O Prisma Client fica em `src/lib/prisma.ts`. No MongoDB não existe `prisma migrate` — quem sincroniza
as coleções/índices é o `npm run db:push` (além dele: `npm run db:studio`).

> ⚠️ A credencial do MongoDB que estava versionada precisa ser rotacionada no Atlas.
