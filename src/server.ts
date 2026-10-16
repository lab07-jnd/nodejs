import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
dotenv.config();

import cors from "cors";

const app = express();

const server = createServer(app);

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World! NodeJS.");
});

server.listen(process.env.PORT, () => {
  console.log(`SERVER RODANDO NA PORTA: ${process.env.PORT} 🚀`);
});
