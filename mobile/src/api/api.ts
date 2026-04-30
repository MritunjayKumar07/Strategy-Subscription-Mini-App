import axios from 'axios';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator
// Change port if your backend runs on a different port
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5286/api' : 'http://localhost:5286/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
