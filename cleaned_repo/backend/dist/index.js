"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const email_service_1 = __importDefault(require("./email_service"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use("/api", email_service_1.default);
const PORT = Number(globalThis.process?.env?.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
