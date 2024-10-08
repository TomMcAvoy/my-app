"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helloWorld_1 = __importDefault(require("../helloWorld"));
test('should return "Hello, World!"', () => {
    expect((0, helloWorld_1.default)()).toBe('Hello, World!');
});
//# sourceMappingURL=helloWorld.test.js.map