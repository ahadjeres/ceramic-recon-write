// ceramicService.ts

import { SignedEvent } from '@ceramic-sdk/events';
import { CeramicClient } from '@ceramic-sdk/http-client';
import { CommitID, StreamID, randomCID } from '@ceramic-sdk/identifiers';
import { createInitEvent as createModelEvent } from '@ceramic-sdk/model-client';
import {
  getDeterministicInitEvent,
  createDataEvent,
  createDataEventPayload
} from '@ceramic-sdk/model-instance-client';
import { getStreamID,  } from '@ceramic-sdk/model-instance-protocol';
import {
  ModelDefinition,
  getModelStreamID,
} from '@ceramic-sdk/model-protocol';
import { getAuthenticatedDID } from '@didtools/key-did';
import type { DID } from 'dids';
import { copyFileSync } from 'fs';

/**
 * Initializes and returns an authenticated DID.
 * @param seed A hex string seed for DID authentication.
 * @returns An authenticated DID instance.
 */
async function initializeDID(seed: string): Promise<DID> {
  // Convert hex string to Buffer (Uint8Array)
  const seedBytes = Buffer.from(seed, 'hex');
  // Validate seed length
  if (seedBytes.length !== 32) {
    throw new Error('Seed must be 32 bytes (64 hex characters) long');
  }
  // Initialize the DID
  const did = await getAuthenticatedDID(seedBytes);
  console.log(`Initialized DID: ${did.id}`);

  return did;
}

/**
 * Deploys a model to the Ceramic network.
 * @param client An instance of CeramicClient.
 * @param did The authenticated DID.
 * @param modelDef The model definition.
 * @returns The StreamID of the deployed model.
 */
async function deployModel(
  client: CeramicClient,
  did: DID,
  modelDef: ModelDefinition
): Promise<StreamID> {
  const modelEvent = await createModelEvent(did, modelDef);
  const modelCID = await client.postEventType(SignedEvent, modelEvent);
  const modelStreamID = getModelStreamID(modelCID);
  console.log(`Created model ${modelStreamID} (CID: ${modelCID})`);
  return modelStreamID;
}

/**
 * Creates a new document based on a deployed model.
 * @param client An instance of CeramicClient.
 * @param did The authenticated DID.
 * @param model The StreamID of the model.
 * @param content The content of the document.
 * @returns The StreamID of the created document.
 */
async function createDocument(
  client: CeramicClient,
  did: DID,
  model: StreamID,
  content: Record<string, unknown>
): Promise<StreamID> {
  // Generate the deterministic init event
  const initEvent = getDeterministicInitEvent(model, did.id);
  // Post the init event to get the stream ID
  const initCid = await client.postEventType(SignedEvent, initEvent);
  const streamID = getStreamID(initCid);

  console.log(`Initialized document with StreamID: ${streamID}`);
  

  // Create a data event to set the content
  const dataEvent = await createDataEvent({
    controller: did,
    newContent: content,
    currentID: CommitID.fromStream(model, randomCID()),
  });
  const dataCid = await client.postEventType(SignedEvent, dataEvent);
  console.log(`Updated document content with CID: ${dataCid}`);

  return streamID;
}

/**
 * Updates an existing document.
 * @param client An instance of CeramicClient.
 * @param did The authenticated DID.
 * @param streamID The StreamID of the document.
 * @param newContent The updated content for the document.
 */
async function updateDocument(
  client: CeramicClient,
  did: DID,
  streamID: StreamID,
  newContent: Record<string, unknown>
): Promise<void> {
  const dataEvent = await createDataEvent({
    controller: did,
    newContent,
    currentID: CommitID.fromStream(streamID),
  });
  const cid = await client.postEventType(SignedEvent, dataEvent);
  console.log(`Updated document with CID: ${cid} and StreamID: ${streamID}`);
}

export {
  initializeDID,
  deployModel,
  createDocument,
  updateDocument,
};
