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
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
// MongoDB connection options
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'myDatabase';
const collectionName = 'users';
// Sample record template
const sampleRecordTemplate = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    createdAt: new Date().toISOString(),
};
function generateUniqueRecords(count) {
    const records = [];
    for (let i = 0; i < count; i++) {
        const record = Object.assign(Object.assign({}, sampleRecordTemplate), { uuid: (0, uuid_1.v4)() });
        records.push(record);
    }
    return records;
}
function writeRecords(db) {
    return new rxjs_1.Observable((observer) => {
        const collection = db.collection(collectionName);
        const records = generateUniqueRecords(10);
        collection
            .insertMany(records)
            .then(() => {
            console.log('Records inserted');
            observer.next('Records inserted');
            observer.complete();
        })
            .catch((error) => {
            observer.error(error);
        });
    });
}
function readRecords(db) {
    return new rxjs_1.Observable((observer) => {
        const collection = db.collection(collectionName);
        collection
            .find({})
            .toArray()
            .then((records) => {
            records.forEach((record) => {
                console.log('Record:', record);
            });
            observer.next('Records read');
            observer.complete();
        })
            .catch((error) => {
            observer.error(error);
        });
    });
}
// Handle SIGINT and SIGTERM to read records
const handleShutdown = (client, db) => {
    readRecords(db).subscribe({
        next: (msg) => console.log(msg),
        complete: () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Record reading complete');
            yield client.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        }),
        error: (err) => console.error('Error reading records:', err),
    });
};
mongodb_1.MongoClient.connect(mongoUrl)
    .then((client) => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    // Run the writeRecords function
    writeRecords(db).subscribe({
        next: (msg) => console.log(msg),
        complete: () => console.log('Record writing complete'),
        error: (err) => console.error('Error writing records:', err),
    });
    // Handle SIGINT and SIGTERM to read records
    process.on('SIGINT', () => handleShutdown(client, db));
    process.on('SIGTERM', () => handleShutdown(client, db));
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
});
//# sourceMappingURL=index.js.map