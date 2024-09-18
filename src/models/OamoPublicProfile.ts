// models/OamoPublicProfile.ts

import { ModelDefinition } from '@ceramic-sdk/model-protocol'
import { OamoDocumentStatusEnum } from '../enums/index.js'

export const OamoPublicProfileModel: ModelDefinition = {
  version: '2.0',
  name: 'OamoPublicProfile',
  description: 'OamoPublicProfile - This document is used to store a list of wallet credentials',
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
      account_score: { type: 'integer', minimum: 0 },
      wallet_holding_score: { type: 'integer', minimum: 0 },
      onchain_usd_amount_score: { type: 'integer', minimum: 0 },
      walletAddress: { type: 'string', minLength: 1, maxLength: 100 },
      createdOn: { type: 'string', format: 'date-time' },
      updatedOn: { type: 'string', format: 'date-time' },
    },
    required: [
      'credentialRelation',
      'credentialRelationCount',
      'status',
      'version',
      'account_score',
      'wallet_holding_score',
      'onchain_usd_amount_score',
      'walletAddress',
      'createdOn',
    ],
    additionalProperties: false,
  },
}
