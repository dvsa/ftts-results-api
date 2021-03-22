import StorageService from '../../../../src/v3/services/storage-service';

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

describe('Storage Service', () => {
  test('Image reference is returned', async () => {
    expect(await StorageService.persistImage({} as any, 'image-data')).toEqual('https://mock-domain.local/resultsimages/mock-file-name.png');
  });
});
