// comprehensiveExample.ts

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

  const oamoCredentialModelStreamID = await deployModel(client, did, OamoCredentialModel)
  const oamoPublicProfileModelStreamID = await deployModel(client, did, OamoPublicProfileModel)
  const oamoCredentialRelationModelStreamID = await deployModel(client, did, OamoCredentialRelationModel)

  // const oamoPublicProfileModelStreamID = StreamID.fromString('kjzl6hvfrbw6c7ztuql3m2m6drt841et6zi9pfsjwsbmk06218rdr21oxilbktj');
  // const oamoCredentialModelStreamID = StreamID.fromString('kjzl6hvfrbw6c5zm8pp4bx5ws3gkztwl2zjw7bx3edsg27712smytk4tuyt4a0h');
  // const oamoCredentialRelationModelStreamID = StreamID.fromString('kjzl6hvfrbw6cb5wblov9k4mdyc15tewe3ox6pgpmpvnd1gye5zmjafadfjw85a');
  
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
