import app from './config';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const storage = getStorage(app);

async function getImageFromStorage(path) {
    try {
        const imageRef = ref(storage, path);
    
        const url = await getDownloadURL(imageRef);
    
        return url;
      } catch (error) {
        console.error('Error downloading image from Firebase Storage:', error);
        return null;
      }
}

export {getImageFromStorage};