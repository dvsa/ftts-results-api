# Introduction
The aim of the Results API is to transport test results from the TETCM to Dynamics 365 so that DVSA has a record of each candidates test.

Result receiver exposes an endpoint from which TETCM can post Test Results. The test results are validated and then added onto the Arrival Queue.

Result sender function reads the messages from the Arrival Queue and sends it to CRM. It also adds an entry to the Payment Events Queue so that DVSA can mark the test revenue as earned.

Confluence Docs - https://dvsa.atlassian.net/wiki/spaces/FB/pages/14369301/0008.+Result+API

# Versions

All functions are versioned. The table below shows the latest and all available versions.

|Function| Type| Latest Version | Available Versions |
|--|--|--|--|
| results-receiver | HTTP Trigger | 3 | 2, 3
| result-sender | Service Bus Trigger | 3 | 3

Version 1 (deprecated) uses TE contract v1.3

Version 2 uses TE contract v1.4

Version 3 uses TE contract v3

The latest contract can be found at https://dvsa.atlassian.net/wiki/spaces/FB/pages/14369301/0008.+Result+API#id-0008.ResultAPI-Appendix3-ResultsAPISpec, to see previous versions look at the history of the page.

# Getting Started

Project is based on Node.js and Azure Functions.

## Dependencies

- Node.js installed on local machine (v12.14.1) https://nodejs.org/en/

- The following packages may need to be installed globally (`npm install -g`) to avoid errors:
- 
- azure-functions-core-tools@3

## Environment

Create a local.settings.json by running `npm run copy-config`

Fill in missing settings

Run `npm install && npm run start`

The API application will listen on port 7073.

## Feature toggles

`DIGITAL_RESULTS_EMAIL_INFO` - true/false, enable or disable sending message to digital results queue.

`DIGITAL_RESULTS_DISABLED_TEST_TYPES` - string, may contain comma separated list of SARAS test types, which will be excluded from digital rersults. Allowed values: CAR,MOTORCYCLE,LGVMC,LGVHPT,LGVCPC,LGVCPCC,PCVMC,PCVHPT,PCVCPC,PCVCPCC,ADI1,ADIHPT,ERS,AMI1,TAXI,EXAMINER_CAR