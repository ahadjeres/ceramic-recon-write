// src/index.ts

import { CeramicClient } from '@ceramicnetwork/http-client';
import * as dotenv from 'dotenv';
import { StreamID } from '@ceramicnetwork/streamid';
import { initializeDID, deployModel, createDocument } from 'ceramicService.js';
import { Database } from './vodooDb/index.js';
import { CriteriasWithPoints } from './models/CriteriasWithPoints.js';

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Initialize Database
  const db = Database.getInstance();
  const dbConnectionString = process.env.DATABASE_URL || '';
  const dbCACert = process.env.DB_CA_CERT; // Optional

  if (!dbConnectionString) {
    console.error('DATABASE_URL is not set in the environment variables.');
    process.exit(1);
  }

  try {
    // Connect to the Database
    await db.connect(dbConnectionString, dbCACert);

    // Initialize Ceramic Client
    const ceramicURL = process.env.CERAMIC_URL || 'https://ceramic-rust.oamo.io';
    const ceramicClient = new CeramicClient({ url: ceramicURL });

    // Initialize DID
    const didSeed = process.env.DID_SEED || 'YOU SHOULD NOT USE THIS SEED';
    if (didSeed === 'YOU SHOULD NOT USE THIS SEED') {
      console.warn('Using default DID seed. This is not secure for production.');
    }
    const did = await initializeDID(didSeed);
    ceramicClient.did = did;

    // Deploy Models (Assuming you need to deploy models before creating documents)
    const oamoPublicProfileModelStreamID = StreamID.fromString('kjzl6hvfrbw6c7cezgwk0wljdi067mdmrxr2sbu5c34dyqjt0ifw56lbbb8xcoz');
    const oamoCredentialModelStreamID = StreamID.fromString('kjzl6hvfrbw6c5pbfk299bds4sjezgp355vad38puqql5p7czrc979dnk2j7h8j');
    const oamoCredentialRelationModelStreamID = StreamID.fromString('kjzl6hvfrbw6c7hpvzx2hjnn3vftuv12eqmjihsq370dlzyeprdl82hfxn51mjn');

    // Deploy or Ensure Models are Deployed
    await deployModel(ceramicClient, did, oamoPublicProfileModelStreamID, {}); // Replace {} with actual content if needed
    await deployModel(ceramicClient, did, oamoCredentialModelStreamID, {});
    await deployModel(ceramicClient, did, oamoCredentialRelationModelStreamID, {});

    console.log('Models are deployed or already exist.');

    // Pagination Parameters
    const pageSize = 100; // Number of addresses per page
    let pageNumber = 1; // Starting page

    while (true) {
      console.log(`Processing Page ${pageNumber}...`);

      // Fetch Paginated Data from Database
      const criterias: CriteriasWithPoints[] = await db.getPaginatedCriteriasWithPoints(pageNumber, pageSize);

      if (criterias.length === 0) {
        console.log('No more data to process.');
        break; // Exit loop when no more data
      }

      // Process Each Row in the Current Page
      for (const criteria of criterias) {
        try {
          // Create OamoPublicProfile Document
          const publicProfileContent = {
            credentialRelation: [],
            credentialRelationCount: 0,
            status: 'ACTIVE',
            version: 1,
            account_score: criteria.account_score || 0,
            wallet_holding_score: criteria.wallet_holding_score || 0,
            onchain_usd_amount_score: criteria.onchain_usd_amount_score || 0,
            walletAddress: criteria.address,
            createdOn: new Date().toISOString(),
          };

          const publicProfileStreamID = await createDocument(
            ceramicClient,
            did,
            oamoPublicProfileModelStreamID,
            publicProfileContent
          );
          console.log(`Created OamoPublicProfile for address ${criteria.address}: ${publicProfileStreamID}`);

          // Create OamoCredential Document
          const credentialContent = {
            credentialRelation: [],
            credentialRelationCount: 0,
            status: 'ACTIVE',
            version: 1,
            chainID: 1, // Adjust based on your data
            chainName: 'Ethereum', // Adjust based on your data
            rootCredential: criteria.unique_key,
            category: criteria.category,
            verifiableCredential: criteria.description,
            createdOn: new Date().toISOString(),
          };

          const credentialStreamID = await createDocument(
            ceramicClient,
            did,
            oamoCredentialModelStreamID,
            credentialContent
          );
          console.log(`Created OamoCredential: ${credentialStreamID}`);

          // Create OamoCredentialRelation Document
          const relationContent = {
            publicProfileId: publicProfileStreamID.toString(),
            credentialId: credentialStreamID.toString(),
            publicProfile: publicProfileStreamID.toString(),
            credential: credentialStreamID.toString(),
            version: 1,
            createdOn: new Date().toISOString(),
          };

          const relationStreamID = await createDocument(
            ceramicClient,
            did,
            oamoCredentialRelationModelStreamID,
            relationContent
          );
          console.log(`Created OamoCredentialRelation: ${relationStreamID}`);
        } catch (error) {
          console.error(`Error processing criteria with unique_key ${criteria.unique_key}:`, error);
          // Optionally, implement retry logic or continue processing other rows
        }
      }

      // Move to the Next Page
      pageNumber += 1;
    }
  } catch (error) {
    console.error('An error occurred during the run flow:', error);
  } finally {
    // Disconnect from the Database
    await db.disconnect();
  }
}

main().catch((error) => {
  console.error('Unhandled error in main:', error);
});
