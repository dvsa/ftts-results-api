import { Context } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 } from 'uuid';

import { BusinessTelemetryEvent, logger } from '../../shared/utils/logger';
import config from '../../shared/config';

export default class StorageService {
  static persistImage = async (context: Context, image: string): Promise<string> => {
    try {
      const filename = `${v4()}.png`;
      const buffered = Buffer.from(image, 'base64');
      const blobClient = BlobServiceClient.fromConnectionString(config.storage.connectionString);
      const { url } = blobClient;
      const blobContainer = blobClient.getContainerClient(config.storage.container);
      await blobContainer.createIfNotExists();
      await blobContainer.uploadBlockBlob(filename, buffered, Buffer.byteLength(buffered));
      return Promise.resolve(`${url}${config.storage.container}/${filename}`);
    } catch (e) {
      logger.error(e, 'StorageService::persistImage');
      logger.event(BusinessTelemetryEvent.RES_API_BINARY_DATA_OFFLOAD_ERROR);
      throw e;
    }
  };
}
