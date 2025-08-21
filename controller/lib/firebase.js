const { initializeApp } = require("firebase/app");
const {
  deleteDoc,
  getFirestore,
  doc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  Timestamp,
  runTransaction,
  arrayUnion,
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
const getFirebaseApp = () => app;

const uploadProcessedData = async (DataToUpload, collectionName) => {
  try {
    await addDoc(collection(firestoreDb, collectionName), DataToUpload);
  } catch (error) {
    errorHandler(error, "firebase-uploadProcessedData");
  }
};

const deleteContent = async (gameType, contentType, postUrl) => {
  try {
    const collectionRef = collection(firestoreDb, gameType);
    const q = query(
      collectionRef,
      where("content_type", "==", contentType),
      where("post_url", "==", postUrl)
    );
    const docSnap = await getDocs(q);
    if (!docSnap.empty) {
      for (const data of docSnap.docs) {
        const docRef = doc(firestoreDb, gameType, data.id);
        await deleteDoc(docRef);
      }
    }
    return;
  } catch (error) {
    errorHandler(error, "firebase-deleteContent");
  }
};

const deleteMedia = async (gpName, uniqueId) => {
  try {
    const collectionRef = collection(firestoreDb, gpName);
    const q = query(collectionRef, where("unique_id", "==", uniqueId));
    const docSnap = await getDocs(q);
    if (!docSnap.empty) {
      const docRef = doc(firestoreDb, gpName, docSnap.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    errorHandler(error, "firebase-deleteMedia");
  }
};

const deleteSavedChatId = async (chatId) => {
  try {
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(
      collectionRef,
      where("reason", "==", "news"),
      where("chat_id", "==", chatId)
    );
    const docSnap = await getDocs(q);
    if (!docSnap.empty) {
      await Promise.all(
        docSnap.map(async (data) => {
          const docRef = doc(firestoreDb, "saved_chat_id", data.id);
          await deleteDoc(docRef);
        })
      );
      return;
    } else {
      return "اصلا ثبت نام نکردی";
    }
  } catch (error) {
    errorHandler(error, "firebase-deleteSavedChatId");
  }
};

/**
 *
 * @param {"news"|"self"} reason
 * @param {boolean} filter
 */
const getSavedChatId = async (reason, gameType) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "saved_chat_id");
    const q = query(
      collectionRef,
      where("reason", "==", reason),
      where("game_type", "==", gameType)
    );
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
const getEventList = async (gpName) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "timeline");
    const currentTime = Timestamp.now();
    const q = query(
      collectionRef,
      where("expire_at", ">=", currentTime),
      where("gp_name", "==", gpName)
    );
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getEventList");
  }
};
const getEvent = async (linkParam) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "timeline");
    const currentTime = Timestamp.now();
    const q = query(
      collectionRef,
      where("expire_at", ">=", currentTime),
      where("link_param", "==", linkParam)
    );
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray[0];
  } catch (error) {
    errorHandler(error, "firebase-getEvent");
  }
};
const checkAndResetExpiredEvents = async (gpName) => {
  try {
    const collectionRef = collection(firestoreDb, "timeline");
    const currentTime = Timestamp.now();
    const q = query(
      collectionRef,
      where("expire_at", "<", currentTime),
      where("gp_name", "==", gpName)
    );
    const docSnap = await getDocs(q);
    if (docSnap.empty) {
      return;
    }
    for (const doc of docSnap.docs) {
      const event = doc.data();
      if (event.reset_duration) {
        const secondsToAdd = event.reset_duration * 24 * 60 * 60;
        const newExpirationTime = new Timestamp(
          event.expire_at.seconds + secondsToAdd,
          0
        );
        await updateDoc(doc.ref, { expire_at: newExpirationTime });
      }
    }
  } catch (error) {
    errorHandler(error, "firebase-checkAndResetExpiredEvents");
  }
};
const getGachaHistory = async (userUid) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "gacha_history");
    const q = query(collectionRef, where("user_uid", "==", userUid));
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getGachaHistory");
  }
};
const updateGachaHistory = async (userUid, newGachaData) => {
  const collectionRef = collection(firestoreDb, "gacha_history");
  const q = query(collectionRef, where("user_uid", "==", userUid));
  const docSnap = await getDocs(q);
  const docRef = doc(firestoreDb, "gacha_history", docSnap.docs[0].id);
  await updateDoc(docRef, {
    gacha_data: newGachaData,
  });
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
const getContentList = async (gameType, contentType) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, gameType);
    const q = query(collectionRef, where("content_type", "==", contentType));
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getContentList");
  }
};
const getHelperList = async (gameType, server) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, "helper_user");
    const q = query(
      collectionRef,
      where("game_type", "==", gameType),
      where("server", "==", server)
    );
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getHelperList");
  }
};
const getMedia = async (gpName, uniqueId) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, gpName);
    const q = query(collectionRef, where("unique_id", "==", uniqueId));
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray[0];
  } catch (error) {
    errorHandler(error, "firebase-getMedia");
  }
};
const getAllMedia = async (gpName) => {
  try {
    const resultArray = [];
    const collectionRef = collection(firestoreDb, gpName);
    const q = query(collectionRef);
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      resultArray.push(doc.data());
    });
    return resultArray;
  } catch (error) {
    errorHandler(error, "firebase-getAllMedia");
  }
};

const createContest = async (contestName) => {
  const contestRef = doc(collection(firestoreDb, "contests"));

  await setDoc(contestRef, { name: contestName });
  return contestRef.id;
};
const getContests = async () => {
  const snap = await getDocs(collection(firestoreDb, "contests"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
const deleteContest = async (contestId) => {
  await deleteDoc(doc(firestoreDb, "contests", contestId));
  return true;
};
const addOption = async (contestId) => {
  const options = await getContestOptions(contestId);
  const maxIndex =
    options.length > 0 ? Math.max(...options.map((o) => o.index)) : 0;
  const nextNumber = maxIndex + 1;

  const optionRef = doc(
    collection(firestoreDb, "contests", contestId, "options")
  );
  await setDoc(optionRef, {
    index: nextNumber,
    votesCount: 0,
    voters: [],
  });

  return optionRef.id;
};
const voteOption = async (contestId, optionId, username) => {
  const optionRef = doc(
    firestoreDb,
    "contests",
    contestId,
    "options",
    optionId
  );

  await runTransaction(firestoreDb, async (t) => {
    const optionSnap = await t.get(optionRef);

    if (!optionSnap.exists()) {
      throw new Error("این گزینه حذف شده!");
    }

    const data = optionSnap.data();

    if (data.voters.includes(username)) {
      throw new Error("قبلا به این رای دادی!");
    }

    t.update(optionRef, {
      votesCount: data.votesCount + 1,
      voters: arrayUnion(username),
    });
  });
};
const getContestOptions = async (contestId) => {
  const snap = await getDocs(
    collection(firestoreDb, "contests", contestId, "options")
  );
  const options = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return options.sort((a, b) => a.index - b.index);
};
const deleteOption = async (contestId, optionId) => {
  await deleteDoc(doc(firestoreDb, "contests", contestId, "options", optionId));
  return true;
};

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  uploadProcessedData,
  getPrimoCode,
  getSavedChatId,
  getContentList,
  getMyChatId,
  deleteSavedChatId,
  getGachaHistory,
  updateGachaHistory,
  getAdminList,
  getHelperList,
  deleteContent,
  getAllMedia,
  getEventList,
  getEvent,
  deleteMedia,
  checkAndResetExpiredEvents,
  createContest,
  addOption,
  voteOption,
  getContestOptions,
  getContests,
  deleteContest,
  deleteOption,
};
