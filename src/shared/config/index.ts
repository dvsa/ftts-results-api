import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  const result = dotenv.config();
  if (result.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
  }
}

export default {
  crm: {
    azureAdUri: process.env.TETCM_CRM_TOKEN_URL || '',
    azureClientId: process.env.TETCM_CRM_CLIENT_ID || '',
    azureClientSecret: process.env.TETCM_CRM_CLIENT_SECRET || '',
    resourceUrl: process.env.TETCM_CRM_RESOURCE_URL || '',
  },
  resultsServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_TRAPI || '',
    arrivalQueue: {
      name: process.env.QUEUE_ARRIVAL_NAME || '',
      maxRetryCount: Number(process.env.MAX_NO_OF_ARRIVAL_RETRIES) || 5,
      maxRetryDelay: Number(process.env.ARRIVAL_RETRY_DELAY) || 60000,
    },
  },
  paymentsServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_PMT_EVENTS || '',
    eventsQueue: {
      name: process.env.QUEUE_PAYMENTS_EVENTS_NAME || '',
    },
  },
  storage: {
    connectionString: process.env.AZURE_GLOBAL_STORAGE || '',
    container: process.env.AZURE_GLOBAL_STORAGE_RESULTS_CONTAINER || 'resultsimages',
  },
};
