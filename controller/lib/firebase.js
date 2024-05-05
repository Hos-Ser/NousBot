const { initializeApp } = require("firebase/app");
const {
  deleteDoc,
  getFirestore,
  doc,
  // setDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  Timestamp,
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

const uploadProcessedData = async (DataToUpload, collectionName) => {
  try {
    await addDoc(collection(firestoreDb, collectionName), DataToUpload);
  } catch (error) {
    errorHandler(error, "firebase-uploadProcessedData");
  }
};

const removeSavedChatId = async (chatId) => {
  try {
    const idk = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(
      collectionRef,
      where("reason", "==", "news"),
      where("chat_id", "==", chatId)
    );
    const savedCIDocSnap = await getDocs(q);
    savedCIDocSnap.forEach((doc) => {
      idk.push(doc.id);
    });
    if (!savedCIDocSnap.empty) {
      const docRef = doc(firestoreDb, "saved_chat_id", idk[0]);
      deleteDoc(docRef);
    }
    return;
  } catch (error) {
    errorHandler(error, "firebase-removeSavedChatId");
  }
};

/**
 *
 * @param {"news"|"self"} reason
 * @param {boolean} filter
 */
const getSavedChatId = async (reason, filter) => {
  try {
    const savedChatId = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    let q;
    if (filter) {
      q = query(collectionRef, where("reason", "==", reason));
    } else {
      q = query(collectionRef);
    }
    const savedCIDocSnap = await getDocs(q);

    savedCIDocSnap.forEach((doc) => {
      savedChatId.push(parseInt(doc.data().chat_id));
    });
    return savedChatId;
  } catch (error) {
    errorHandler(error, "firebase-getSavedChatId");
  }
};
const getMyChatId = async () => {
  try {
    const idk = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(collectionRef, where("reason", "==", "self"));
    const myCIDocSnap = await getDocs(q);

    myCIDocSnap.forEach((doc) => {
      idk.push(parseInt(doc.data().chat_id));
    });
    return idk[0];
  } catch (error) {
    errorHandler(error, "firebase-getMyChatId");
  }
};

const getPrimoCode = async (game) => {
  try {
    const primoCodes = [];
    const collectionRef = collection(firestoreDb, "primo_code");
    const currentTime = Timestamp.now();
    const q = query(
      collectionRef,
      where("expire_at", ">=", currentTime),
      where("game", "==", game)
    );
    const expiredDocSnap = await getDocs(q);

    expiredDocSnap.forEach((doc) => {
      primoCodes.push(doc.data().code);
    });
    return primoCodes;
  } catch (error) {
    errorHandler(error, "firebase-getPrimoCode");
  }
};

const getFirebaseApp = () => app;

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessedData,
  getPrimoCode,
  getSavedChatId,
  getMyChatId,
  removeSavedChatId,
};
