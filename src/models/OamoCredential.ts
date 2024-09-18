// models/OamoCredential.ts

import { ModelDefinition } from '@ceramic-sdk/model-protocol'
import { OamoDocumentStatusEnum } from '../enums/index.js'

export const OamoCredentialModel: ModelDefinition = {
  version: '2.0',
  name: 'OamoCredential',
  description: 'OamoCredential - This document is used to store Oamo Public Verifiable Credentials',
  accountRelation: { type: 'single' },
  interface: false,
  implements: [],
  schema: {
    type: 'object',
    properties: {
      credentialRelation: {
        type: 'array',
        items: { type: 'string', format: 'streamid' }, // References to OamoCredentialRelation
        default: [],
      },
      credentialRelationCount: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
      status: OamoDocumentStatusEnum, 
      version: { type: 'integer', minimum: 1, maximum: 9999 },
      chainID: { type: 'integer' },
      chainName: { type: 'string', minLength: 1, maxLength: 100 },
      rootCredential: { type: 'string', minLength: 1, maxLength: 2048 },
      category: { type: 'string', minLength: 1, maxLength: 2048 },
      verifiableCredential: { type: 'string', minLength: 1, maxLength: 2048 },
      createdOn: { type: 'string', format: 'date-time' },
      updatedOn: { type: 'string', format: 'date-time' },
    },
    required: [
      'status',
      'version',
      'chainID',
      'chainName',
      'rootCredential',
      'category',
      'verifiableCredential',
      'createdOn',
    ],
    additionalProperties: false,
  },
}
