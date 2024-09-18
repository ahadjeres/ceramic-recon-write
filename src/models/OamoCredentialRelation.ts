// models/OamoCredentialRelation.ts

import { ModelDefinition } from '@ceramic-sdk/model-protocol'

export const OamoCredentialRelationModel: ModelDefinition = {
  version: '2.0',
  name: 'OamoCredentialRelation',
  description: 'Relation between OamoPublicProfile and OamoCredential in a many-to-many relationship.',
  accountRelation: { type: 'single' }, // Assuming single relation per account
  interface: false,
  implements: [],
  schema: {
    type: 'object',
    properties: {
      publicProfileId: { type: 'string', format: 'streamid' }, // Reference to OamoPublicProfile
      credentialId: { type: 'string', format: 'streamid' }, // Reference to OamoCredential
      publicProfile: { type: 'string', format: 'streamid' }, // Embedded relation
      credential: { type: 'string', format: 'streamid' }, // Embedded relation
      version: { type: 'integer', minimum: 1, maximum: 9999 },
      createdOn: { type: 'string', format: 'date-time' },
      updatedOn: { type: 'string', format: 'date-time' },
    },
    required: [
      'publicProfileId',
      'credentialId',
      'publicProfile',
      'credential',
      'version',
      'createdOn',
    ],
    additionalProperties: false,
  },
}
