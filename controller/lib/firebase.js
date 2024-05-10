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
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(
      collectionRef,
      where("reason", "==", "news"),
      where("chat_id", "==", chatId)
    );
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.id);
    });
    if (!docSnap.empty) {
      const docRef = doc(firestoreDb, "saved_chat_id", resultArray[0]);
      deleteDoc(docRef);
    } else {
      throw new Error("اصلا ثبت نام نکردی!");
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
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    let q;
    if (filter) {
      q = query(collectionRef, where("reason", "==", reason));
    } else {
      q = query(collectionRef);
    }
    const docSnap = await getDocs(q);

    docSnap.forEach((doc) => {
      resultArray.push(parseInt(doc.data().chat_id));
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getSavedChatId");
  }
};
const getMyChatId = async () => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(collectionRef, where("reason", "==", "self"));
    const docSnap = await getDocs(q);

    docSnap.forEach((doc) => {
      resultArray.push(parseInt(doc.data().chat_id));
    });
    return resultArray[0];
  } catch (error) {
    errorHandler(error, "firebase-getMyChatId");
  }
};
const getPrimoCode = async (gameType) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "primo_code");
    const currentTime = Timestamp.now();
    const q = query(
      collectionRef,
      where("expire_at", ">=", currentTime),
      where("game_type", "==", gameType)
    );
    const docSnap = await getDocs(q);

    docSnap.forEach((doc) => {
      resultArray.push(doc.data().code);
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getPrimoCode");
  }
};
const getAdminList = async () => {
  const resultArray = [];
  const collectionRef = collection(firestoreDb, "admin_username");
  // const q = query(collectionRef);
  const docSnap = await getDocs(collectionRef);

  docSnap.forEach((doc) => {
    resultArray.push(doc.data().username);
  });
  return resultArray;
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
  getAdminList,
};
