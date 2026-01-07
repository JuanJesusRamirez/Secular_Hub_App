import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoint
app.get('/api/info', (req: Request, res: Response) => {
    res.json({
        message: "¡Hola desde TypeScript!",
        status: "Running on Azure App Service ready mode",
        timestamp: new Date().toISOString()
    });
});

// Fallback to index.html logic removed temporarily for Express 5 compatibility troubleshooting
// Serving static files and API only for now.


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
