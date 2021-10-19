import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import 'colors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import userRouter from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

const app = express();
dotenv.config();

app.use(express.urlencoded({ extended: false }));

// Body parser
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security header
app.use(helmet());

// Enable CORS
app.use(cors());

// Cookie parser
app.use(cookieParser());

// Sanitize Data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limitting
const limmiter = rateLimit({
  windowMs: 10 * 60 * 10000, // 10 mins
  max: 100,
});

app.use(limmiter);

// Mounth routers
app.use('/users', userRouter);

// Error Handler
app.use(errorHandler);

app.get('*', (req, res) => {
  console.log('404 there is not route');
  res.status(404).json({ success: false, message: 'there is not route ' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`The server started on port ${PORT}`.yellow.bold);

  // Connect database
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.underline.bold.cyan);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => {
    process.exit();
  });
});
