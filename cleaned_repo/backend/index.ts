import express from "express";
import bodyParser from "body-parser";


const app = express();
app.use(bodyParser.json());

// app.use("/api", emailService);

const PORT = Number((globalThis as any).process?.env?.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
