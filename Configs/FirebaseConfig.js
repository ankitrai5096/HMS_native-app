import firestore from '@react-native-firebase/firestore'; // Firebase Firestore
import auth from '@react-native-firebase/auth'; // Firebase Auth
import messaging from '@react-native-firebase/messaging'; // Firebase Messaging
import storage from '@react-native-firebase/storage'; // Firebase Storage

// Export Firebase services for use in your app
export const fireDB = firestore();
export const fireStorage = storage();  // Firestore instance
export { auth, storage, messaging }; // Exporting other services
