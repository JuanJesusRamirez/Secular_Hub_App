"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Serve static files from the 'public' folder
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// API Endpoint
app.get('/api/info', (req, res) => {
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
