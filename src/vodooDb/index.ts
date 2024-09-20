import pg from 'pg';

export class Database {
  private static instance: Database;  
  private pool: pg.Pool | null = null;
  private dbClient: pg.PoolClient | null = null;
  // private dbOperations: DbOperations | null = null; // Add a reference to DbOperations

  private constructor() {
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(connectionString: string, cert: string | undefined = undefined): Promise<void> {
    const sslConfig = cert
      ? {
        rejectUnauthorized: true,
        ca: cert, // Use cert if DB_CA_CERT exists
      }
      : null; // Do not use SSL config if DB_CA_CERT is not set

    const poolConfig: {
      connectionString: string;
      ssl: any
    } = {
      connectionString: connectionString,
      ssl: null,
    };

    // Add SSL configuration to poolConfig only if it exists
    if (sslConfig) {
      poolConfig.ssl = sslConfig;
    }

    this.pool = new pg.Pool(poolConfig);

    if (this.dbClient) {
      return; // Already connected
    }
    try {
      this.dbClient = await this.pool.connect();
      const res = await this.dbClient.query("SELECT NOW()"); // Test query
      // ... rest of the method ...
    } catch (error) {
      // ... error handling ...
      console.log(error);
    }
  }


  // Disconnect from the database
  public async disconnect(): Promise<void> {
    await this.pool?.end();
  }

  public getPool(): pg.PoolClient {
    return this.dbClient!;
  }
}
