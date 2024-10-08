import { MongoClient, Db } from 'mongodb';
const mongoClient = new MongoClient('mongodb://localhost:27017');
export let mongoDb: Db;
export async function connectMongo(): Promise<void> {
  await mongoClient.connect();
  mongoDb = mongoClient.db('mydb');
}
