import { BlobServiceClient } from '@azure/storage-blob';
import exifremove from 'exifremove';
import Jimp from 'jimp';

import { BusinessTelemetryEvent, logger } from '../../shared/utils/logger';
import { ValidationError } from '../../shared/interfaces';
import config from '../../shared/config';

export default class StorageService {
  static async persistImage(image: string, fieldname: string, filename: string): Promise<void> {
    try {
      const buffered = Buffer.from(image, 'base64');
      if (!this.isJpeg(buffered)) {
        throw new ValidationError(`Validation Error - '${fieldname}' image is not a jpeg`);
      }
      const cleaned = await this.cleanImage(buffered);
      const blobClient = BlobServiceClient.fromConnectionString(config.storage.connectionString);
      const blobContainer = blobClient.getContainerClient(config.storage.container);
      await blobContainer.createIfNotExists();
      await blobContainer.uploadBlockBlob(filename, cleaned, Buffer.byteLength(cleaned));
    } catch (e) {
      logger.error(e as Error, 'StorageService::persistImage');
      logger.event(BusinessTelemetryEvent.RES_API_BINARY_DATA_OFFLOAD_ERROR);
      throw e;
    }
  }

  private static isJpeg(buffer: Buffer): boolean {
    // Compare against JPEG header
    return buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  }

  private static async cleanImage(buffer: Buffer): Promise<Buffer> {
    const exifRemoved = exifremove.remove(buffer); // Removes exif metadata
    const jimped = await Jimp.read(exifRemoved); // Removes other metadata (profile, xmp etc.)
    return jimped.getBufferAsync(Jimp.MIME_JPEG);
  }
}
