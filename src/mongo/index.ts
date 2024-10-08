import { MongoClient, Db, Collection } from 'mongodb';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

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

interface Record {
  name: string;
  email: string;
  age: number;
  createdAt: string;
  uuid: string;
}

function generateUniqueRecords(count: number): Record[] {
  const records: Record[] = [];
  for (let i = 0; i < count; i++) {
    const record: Record = { ...sampleRecordTemplate, uuid: uuidv4() };
    records.push(record);
  }
  return records;
}

function writeRecords(db: Db): Observable<string> {
  return new Observable((observer) => {
    const collection: Collection = db.collection(collectionName);
    const records: Record[] = generateUniqueRecords(10);

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

function readRecords(db: Db): Observable<string> {
  return new Observable((observer) => {
    const collection: Collection = db.collection(collectionName);

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
const handleShutdown = (client: MongoClient, db: Db) => {
  readRecords(db).subscribe({
    next: (msg) => console.log(msg),
    complete: async () => {
      console.log('Record reading complete');
      await client.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    },
    error: (err) => console.error('Error reading records:', err),
  });
};

MongoClient.connect(mongoUrl)
  .then((client) => {
    console.log('Connected to MongoDB');
    const db: Db = client.db(dbName);

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
