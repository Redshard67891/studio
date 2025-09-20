import { MongoClient } from 'mongodb';

// I'm using the connection string you provided directly for now.
// For better security and flexibility, it's highly recommended to move this 
// to an environment variable (e.g., in a .env.local file).
const uri = "mongodb://presensys:7XF6gVDT7OVqWXwFuG5-zU-0M1fscwNipfUtTxqEEK1hNFV0@254e5187-cf1b-4404-b143-208296bb5756.eur3.firestore.goog:443/pre-sensys?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// This approach is recommended by Vercel to handle database connections
// in a serverless environment. It prevents creating too many connections
// during development with Hot Module Replacement (HMR).
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
