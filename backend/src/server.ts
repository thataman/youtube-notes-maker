import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import videoRoutes from './routes/videoRoutes';
import slideRoutes from './routes/slideRoutes';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// Enable CORS for requests from your React app's origin (and potentially the extension)
// Be more specific in production!
app.use(cors({
  origin: ['http://localhost:5173', 'chrome-extension://nbkmichpgjkleeedpbgeaceadalipofj'], // Allow frontend dev server and installed extension
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true // If you were using cookies/sessions
}));

// Body Parser Middleware to handle JSON and large base64 strings
// Increase limit for base64 image data - adjust as needed (e.g., '50mb')
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// --- API Routes ---
app.get('/', (_, res) => {
  res.send('API is running...')
  return;
})
app.use('/api/videos', videoRoutes);
app.use('/api/slides', slideRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));