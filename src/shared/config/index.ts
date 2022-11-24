import { convertTimespanToSeconds, Timespan } from '../../v4/utils/time';

export default {
  websiteSiteName: process.env.WEBSITE_SITE_NAME || '',
  userAssignedClientId: process.env.USER_ASSIGNED_ENTITY_CLIENT_ID || '',
  azureTenantId: process.env.AZURE_TENANT_ID || '',
  functionTimeout: convertTimespanToSeconds((process.env.AzureFunctionsJobHost__functionTimeout || '00:10:00') as Timespan),
  functionTimeoutBuffer: parseInt(process.env.FUNCTION_TIMEOUT_BUFFER_SECONDS || '30', 10),
  crm: {
    azureClientId: process.env.TETCM_CRM_CLIENT_ID || '',
    azureClientSecret: process.env.TETCM_CRM_CLIENT_SECRET || '',
    resourceUrl: process.env.TETCM_CRM_RESOURCE_URL || '',
    scope: process.env.TETCM_CRM_SCOPE || '',
  },
  concurrency: {
    parallelProcessCount: Number(process.env.PARALLEL_PROCESS_COUNT) || 5,
    processInterval: Number(process.env.PARALLEL_PROCESS_INTERVAL) || 50, // time in ms between a result is processed in a single thread
  },
  resultsServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_TRAPI || '',
    arrivalQueue: {
      name: process.env.QUEUE_ARRIVAL_NAME || '',
      retrieveCount: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT) || 50,
      additionalRetrieveCount: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT_ADDITIONAL) || 50,
      maxRetrieveCount: Number(process.env.QUEUE_ARRIVAL_RETRIEVE_COUNT_MAX) || 150,
    },
  },
  paymentsServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_PMT_EVENTS || '',
    eventsQueue: {
      name: process.env.QUEUE_PAYMENTS_EVENTS_NAME || '',
    },
  },
  digitalResultsServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_DR_PROCESSOR || '',
    eventsQueue: {
      name: process.env.QUEUE_DR_PROCESSOR_NAME || '',
    },
  },
  testResultPersisterServiceBus: {
    connectionString: process.env.SERVICE_BUS_CONNECTION_STRING_TR_PERSISTER || '',
    eventsQueue: {
      name: process.env.QUEUE_TR_PERSISTER_NAME || '',
    },
  },
  storage: {
    connectionString: process.env.AZURE_GLOBAL_STORAGE || '',
    container: process.env.AZURE_GLOBAL_STORAGE_RESULTS_CONTAINER || 'resultsimages',
  },
  dva: {
    adiBands: {
      band1: process.env.DVA_ADI_BAND_1 || 'Road Procedure',
      band2: process.env.DVA_ADI_BAND_2 || 'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
      band3: process.env.DVA_ADI_BAND_3 || 'Driving Test, Disabilities, Law',
      band4: process.env.DVA_ADI_BAND_4 || 'Publications, Instructional Techniques',
    },
    amiBands: {
      band1: process.env.DVA_AMI_BAND_1 || 'Road Procedure & Rider Safety',
      band2: process.env.DVA_AMI_BAND_2 || 'Traffic Signs and Signals, Bike Control, Pedestrians, Mechanical Knowledge',
      band3: process.env.DVA_AMI_BAND_3 || 'Driving Test, Disabilities, The Law & The Environment',
      band4: process.env.DVA_AMI_BAND_4 || 'Publications, Instructional Techniques',
    },
  },
  featureToggles: {
    digitalResultsEmailInfo: process.env.DIGITAL_RESULTS_EMAIL_INFO === 'true',
    testResultPersister: process.env.TEST_RESULT_PERSISTER_TOGGLE === 'true',
    writeTestItemsAndSectionsToCRM: process.env.WRITE_TEST_ITEMS_AND_SECTIONS_TO_CRM === 'true',
    calculateTestBandScores: process.env.CALCULATE_TEST_BAND_SCORES === 'true',
    digitalResultsDisabledTestTypes: process.env.DIGITAL_RESULTS_DISABLED_TEST_TYPES || '',
  },
};
