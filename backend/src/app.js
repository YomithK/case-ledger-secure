import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';

const app = express();

// Do not advertise the framework (X-Powered-By: Express)
app.disable('x-powered-by');

// Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, ...)
app.use(helmet());

// CORS: only allow the configured frontend origin(s) (comma-separated FRONTEND_URL)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (no Origin header) and allowlisted origins only
            callback(null, !origin || allowedOrigins.includes(origin));
        },
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        data: { timestamp: new Date().toISOString() },
    });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
