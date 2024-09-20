// src/database/Database.ts

import pg from 'pg';
import { CriteriasWithPoints } from '../models/CriteriasWithPoints.ts';

export class Database {
  private static instance: Database; 
  private pool: pg.Pool | null = null;
  private dbClient: pg.PoolClient | null = null;

  private constructor() {}

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
          ca: cert, // Use cert if provided
        }
      : false; // Use SSL if cert is provided, else disable SSL

    const poolConfig: pg.PoolConfig = {
      connectionString: connectionString,
      ssl: sslConfig,
    };

    this.pool = new pg.Pool(poolConfig);

    if (this.dbClient) {
      return; // Already connected
    }

    try {
      this.dbClient = await this.pool.connect();
      const res = await this.dbClient.query("SELECT NOW()"); // Test query
      console.log('Connected to the database at:', res.rows[0].now);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error; // Rethrow the error after logging
    }
  }

  // Disconnect from the database
  public async disconnect(): Promise<void> {
    try {
      await this.pool?.end();
      console.log('Disconnected from the database.');
    } catch (error) {
      console.error('Error disconnecting from the database:', error);
      throw error;
    }
  }

  // Get the pool client
  public getPoolClient(): pg.PoolClient {
    if (!this.dbClient) {
      throw new Error('Database client is not connected.');
    }
    return this.dbClient;
  }

  /**
   * Retrieves paginated criterias with associated points data.
   * 
   * @param pageNumber - The current page number (1-based indexing).
   * @param pageSize - The number of addresses per page.
   * @returns A promise that resolves to an array of CriteriasWithPoints.
   */
  public async getPaginatedCriteriasWithPoints(pageNumber: number, pageSize: number): Promise<CriteriasWithPoints[]> {
    if (!this.pool) {
      throw new Error('Database is not connected.');
    }

    // Validate input
    if (pageNumber < 1) {
      throw new Error('Page number must be greater than or equal to 1.');
    }

    if (pageSize < 1) {
      throw new Error('Page size must be greater than or equal to 1.');
    }

    const offset = (pageNumber - 1) * pageSize;

    const query = `
      WITH paginated_addresses AS (
          SELECT
              address
          FROM
              data_to_publish.criterias
          WHERE
              published_on_ceramic IS NULL
          GROUP BY
              address
          ORDER BY
              address
          LIMIT $1 OFFSET $2
      )
      SELECT
          c.unique_key,
          c.credential_name,
          c.address,
          'chain' AS chain_value,
          c.category,
          c.description,
          ap.onchain_usd_amount_score,
          ap.wallet_holding_score,
          ap.account_score
      FROM
          data_to_publish.criterias c
      LEFT JOIN
          data_to_publish.address_points ap ON c.address = ap.address
      WHERE
          c.published_on_ceramic IS NULL
          AND c.address IN (SELECT address FROM paginated_addresses)
      ORDER BY
          c.address,
          c.unique_key;
    `;

    try {
      const client = await this.pool.connect();
      try {
        const res = await client.query<CriteriasWithPoints>(query, [pageSize, offset]);
        return res.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error executing paginated query:', error);
      throw error;
    }
  }
}
