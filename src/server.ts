import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import cors from "cors";
import router from "./routes/router.js";

const app = express();

const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("", router);

app.get("/", (req, res) => {
  res.send("Hello World! NodeJS.");
});

server.listen(process.env.PORT, () => {
  console.log(`SERVER RODANDO NA PORTA: ${process.env.PORT} 🚀`);
});
