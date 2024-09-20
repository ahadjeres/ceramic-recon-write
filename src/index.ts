
import { CeramicClient } from '@ceramic-sdk/http-client'
import * as dotenv from "dotenv";
import { CommitID, StreamID } from '@ceramic-sdk/identifiers'
import { initializeDID, deployModel, createDocument, updateDocument } from './ceramicService.js'
import { OamoCredentialModel } from './models/OamoCredential.js'
import { OamoPublicProfileModel } from './models/OamoPublicProfile.js'
import { OamoCredentialRelationModel } from './models/OamoCredentialRelation.js'

dotenv.config();

async function main() {
  console.log(process.env.CERAMIC_URL)
  const client = new CeramicClient({ url: process.env.CERAMIC_URL  || "https://ceramic-rust.oamo.io"})
  const did = await initializeDID(process.env.DID_SEED || "YOU SHOULD NOT USE THIS SEED") 

  // Deploy Models


  const oamoPublicProfileModelStreamID = StreamID.fromString('kjzl6hvfrbw6c7cezgwk0wljdi067mdmrxr2sbu5c34dyqjt0ifw56lbbb8xcoz');
  const oamoCredentialModelStreamID = StreamID.fromString('kjzl6hvfrbw6c5pbfk299bds4sjezgp355vad38puqql5p7czrc979dnk2j7h8j');
  const oamoCredentialRelationModelStreamID = StreamID.fromString('kjzl6hvfrbw6c7hpvzx2hjnn3vftuv12eqmjihsq370dlzyeprdl82hfxn51mjn');

  // Create OamoPublicProfile Document
  const publicProfileContent = {
    credentialRelation: [],
    credentialRelationCount: 0,
    status: 'ACTIVE',
    version: 1,
    account_score: 100,
    wallet_holding_score: 50,
    onchain_usd_amount_score: 200,
    walletAddress: '0xYourWalletAddress',
    createdOn: new Date().toISOString(),
  }

  const publicProfileStreamID = await createDocument(client, did, oamoPublicProfileModelStreamID, publicProfileContent)
  console.log(`Created OamoPublicProfile: ${publicProfileStreamID}`)

  // Create OamoCredential Document
  const credentialContent = {
    credentialRelation: [],
    credentialRelationCount: 0,
    status: 'ACTIVE',
    version: 1,
    chainID: 1,
    chainName: 'Ethereum',
    rootCredential: 'rootCredentialString',
    category: 'Finance',
    verifiableCredential: 'verifiableCredentialString',
    createdOn: new Date().toISOString(),
  }

  const credentialStreamID = await createDocument(client, did, oamoCredentialModelStreamID, credentialContent)
  console.log(`Created OamoCredential: ${credentialStreamID}`)

  // Create OamoCredentialRelation Document
  const relationContent = {
    publicProfileId: publicProfileStreamID.toString(),
    credentialId: credentialStreamID.toString(),
    publicProfile: publicProfileStreamID.toString(),
    credential: credentialStreamID.toString(),
    version: 1,
    createdOn: new Date().toISOString(),
  }

  const relationStreamID = await createDocument(client, did, oamoCredentialRelationModelStreamID, relationContent)
  console.log(`Created OamoCredentialRelation: ${relationStreamID}`)

//   // Update OamoCredential Status
//   const doc = await client.loadStream(credentialStreamID)
//   const currentCommitID = doc.commitId

//   const updatedContent = {
//     status: 'INACTIVE',
//     updatedOn: new Date().toISOString(),
//   }

//   await updateDocument(client, did, currentCommitID, updatedContent)
//   console.log(`Updated OamoCredential ${credentialStreamID} status to INACTIVE`)
}

main().catch((error) => {
  console.error('Error in comprehensive example:', error)
})