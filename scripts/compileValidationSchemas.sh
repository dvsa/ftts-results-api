#!/bin/bash

# Compile the request body validation schemas (TS types -> json schemas)
# Using typescript-json-schema - see https://github.com/vega/ts-json-schema-generator
# Run this script if the types are changed or new ones added

npx ts-json-schema-generator --path 'src/shared/interfaces/result.ts' --type 'SARASResultBody' --validation-keywords notEmpty --out src/v4/schemas/SARASResultBodyV4.schema.json
