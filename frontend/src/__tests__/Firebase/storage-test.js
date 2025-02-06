import '@testing-library/jest-dom/extend-expect';
import { getImageFromStorage } from '../../Firebase/storage';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

jest.mock('../../Firebase/config');

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    getDownloadURL: jest.fn(),
}));

describe('getImageFromStorage', () => {
    test('returns image URL when download is successful', async () => {
        const imagePath = 'images/example.jpg';
        const imageURL = 'https://example.com/image.jpg';

        getStorage.mockReturnValue({});
        ref.mockReturnValue({});
        getDownloadURL.mockResolvedValue(imageURL);

        const url = await getImageFromStorage(imagePath);

        expect(url).toEqual(imageURL);
    });

    test('returns null when download fails', async () => {
        const imagePath = 'images/example.jpg';
        const errorMessage = 'Download failed';

        getStorage.mockReturnValue({});
        ref.mockReturnValue({});
        getDownloadURL.mockRejectedValue(new Error(errorMessage));

        const url = await getImageFromStorage(imagePath);

        expect(url).toBeNull();
    });
});