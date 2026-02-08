import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';
import { errors } from 'celebrate';
import authRouter from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoutes.js';


const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());



// GET /students — список усіх студентів
app.use(authRouter);
app.use(notesRouter);
app.use(userRouter);



// Middleware 404 (після всіх маршрутів)
app.use(notFoundHandler);
// Middleware для обробки помилок (celebrate\validation)
app.use(errors());
// Middleware для обробки помилок (останнє)
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


