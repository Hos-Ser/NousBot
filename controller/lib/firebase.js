const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
} = require("firebase/firestore");
const { errorHandler } = require("./helper");

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = process.env;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

let app;
let firestoreDb;

const initializeFirebaseApp = () => {
  try {
    app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore();
    return app;
  } catch (error) {
    errorHandler(error, "firebase-initializeFirebaseApp");
  }
};

const uploadProcessedData = async (DataToUpload) => {
  try {
    const document = doc(firestoreDb, "testin", "unique-id-for-the-doc");
    let dataUpdated = await setDoc(document, DataToUpload);
    return dataUpdated;
  } catch (error) {
    errorHandler(error, "firebase- uploadProcessedData ");
  }
};

const getTheData = async (from, to) => {
  try {
    const collectionRef = collection(firestoreDb, "testin");
    const finalData = [];
    const q = query(collectionRef);

    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      finalData.push(doc.data());
    });
    return finalData;
  } catch (error) {
    errorHandler(error, "firebase-getTheData");
  }
};

const getFirebaseApp = () => app;

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessedData,
  getTheData,
};
