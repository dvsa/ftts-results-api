# Introduction
The aim of the Results API is to transport test results from the TETCM to Dynamics 365 so that DVSA has a record of each candidates test.

Result receiver exposes an endpoint from which TETCM can post Test Results. The test results are validated and then added onto the Arrival Queue.

Result sender function reads the messages from the Arrival Queue and sends it to CRM. It also adds an entry to the Payment Events Queue so that DVSA can mark the test revenue as earned.

Confluence Docs - https://wiki.dvsacloud.uk/display/FB/0008.+Result+API

# Versions

All functions are versioned. The table below shows the latest and all available versions.

|Function| Type| Latest Version | Available Versions |
|--|--|--|--|
| results-receiver | HTTP Trigger | 3 | 2, 3
| result-sender | Service Bus Trigger | 3 | 3

Version 1 (deprecated) uses TE contract v1.3

Version 2 uses TE contract v1.4

Version 3 uses TE contract v3

The latest contract can be found at https://wiki.dvsacloud.uk/pages/viewpage.action?pageId=81627613, to see previous versions look at the history of the page.

# Getting Started

Project is based on Node.js and Azure Functions.

## Dependencies

- Node.js installed on local machine (v12.14.1) https://nodejs.org/en/

- The following packages may need to be installed globally (`npm install -g`) to avoid errors:
- 
- azure-functions-core-tools@3

## Environment

Create .env file in the project root. The file should have the following variables set:

TETCM_CRM_TOKEN_URL=

TETCM_CRM_CLIENT_ID=

TETCM_CRM_CLIENT_SECRET=

TETCM_CRM_RESOURCE_URL=

APPINSIGHTS_INSTRUMENTATIONKEY=

LOG_LEVEL=

NODE_ENV=

SERVICE_BUS_CONNECTION_STRING_TRAPI=

QUEUE_ARRIVAL_NAME=

SERVICE_BUS_CONNECTION_STRING_PMT_EVENTS=

QUEUE_PAYMENTS_EVENTS_NAME=

Add local.settings.json

`cp local.settings.example.json local.settings.json`

Run `npm install && npm run start`

The API application will listen on port 7073.
