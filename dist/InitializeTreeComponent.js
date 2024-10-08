"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const react_1 = require("react");
const tree_1 = require("./tree");
const uuid_1 = require("uuid");
const utils_1 = require("./utils/utils");
const encryption_1 = require("./encryption/encryption");
const InitializeTreeComponent = () => {
    (0, react_1.useEffect)(() => {
        function initializeTree() {
            return __awaiter(this, void 0, void 0, function* () {
                const { publicKey: senderPublicKey, privateKey: senderPrivateKey } = yield (0, utils_1.generateLocalKeyPair)();
                const { publicKey: recipientPublicKey, privateKey: recipientPrivateKey } = yield (0, utils_1.generateLocalKeyPair)();
                const apiData = {
                    api_id: '1234567890abcdef',
                    api_name: 'My API',
                    api_version: 'v1',
                    api_key: 'abcdef1234567890',
                    request: {
                        method: 'GET',
                        url: '/my-api/v1/resource',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer token',
                        },
                        body: '',
                        params: {
                            query: {
                                param1: 'value1',
                                param2: 'value2',
                            },
                            path: {
                                id: '123',
                            },
                        },
                    },
                    response: {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: '{"key":"value"}',
                    },
                    timestamp: '2023-10-01T12:34:56.789Z',
                    latency: 123,
                    ip_address: '192.168.1.1',
                    geo: {
                        country: 'US',
                        region: 'CA',
                        city: 'San Francisco',
                    },
                    meta_data: {
                        custom_field1: 'value1',
                        custom_field2: 'value2',
                    },
                };
                const signature = yield (0, encryption_1.signData)(JSON.stringify(apiData), senderPrivateKey);
                const node1 = new tree_1.ExtendedTreeNode((0, uuid_1.v4)(), 'APIRequestResponse', apiData, recipientPublicKey, signature, new Date(), new Date());
                console.log(yield node1.getDecryptedData());
            });
        }
        initializeTree();
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("h2", { children: "Initializing Tree..." }) }));
};
exports.default = InitializeTreeComponent;
//# sourceMappingURL=InitializeTreeComponent.js.map