"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const InitializeTreeComponent_1 = __importDefault(require("./InitializeTreeComponent"));
const App = () => {
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "App" }, { children: (0, jsx_runtime_1.jsxs)("header", Object.assign({ className: "App-header" }, { children: [(0, jsx_runtime_1.jsx)("h1", { children: "Welcome to My App" }), (0, jsx_runtime_1.jsx)(InitializeTreeComponent_1.default, {})] })) })));
};
exports.default = App;
//# sourceMappingURL=App.js.map