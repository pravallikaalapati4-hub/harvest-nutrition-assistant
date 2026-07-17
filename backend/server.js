require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const progressRoutes = require('./routes/progressRoutes');

// ================== CONNECT DATABASE ==================
connectDB();

const app = express();

// ================== SECURITY ==================
app.use(helmet());

// ================== CORS ==================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pravallikaalapati4-hub.github.io',
  'https://pravallikaalapati4-hub.github.io/nutrition-assistant-',
  'https://pravallikaalapati4-hub.github.io/harvest-nutrition-assistant',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (Postman, curl, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS Origin:", origin);

      return callback(
        new Error(`CORS Error: Origin ${origin} is not allowed`)
      );
    },
    credentials: true,
  })
);

// ================== MIDDLEWARE ==================
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ================== RATE LIMIT ==================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api/auth', authLimiter);

// ================== ROUTES ==================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nutrition Assistant Backend is Running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nutrition Assistant API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/progress', progressRoutes);

// ================== ERROR HANDLERS ==================
app.use(notFound);
app.use(errorHandler);

// ================== SERVER ==================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// ================== UNHANDLED REJECTION ==================
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;