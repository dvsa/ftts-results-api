import { ValidationError } from '../../../../src/shared/interfaces';
import StorageService from '../../../../src/v4/services/storage-service';

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: () => ({
      getContainerClient: () => ({
        createIfNotExists: () => {},
        uploadBlockBlob: () => {},
      }),
      url: 'https://mock-domain.local/',
    }),
  },
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-file-name',
}));
jest.mock('exifremove', () => ({
  remove: (buffer: Buffer) => buffer,
}));
jest.mock('jimp', () => ({
  read: (buffer: Buffer) => ({
    getBufferAsync: async () => Promise.resolve(buffer),
  }),
}));

describe('Storage Service', () => {
  test('Accepts jpeg input and returns void', async () => {
    expect(await StorageService.persistImage('/9j/im-a-jpeg', 'fieldname', 'mock-file-name.jpeg'))
      .toBeUndefined();
  });

  test('Rejects non-jpeg input', async () => {
    await expect(StorageService.persistImage('iVBORw-im-a-png', 'fieldname', 'mock-file-name.txt')).rejects.toThrow(ValidationError);
  });
});
