const {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} = require("firebase/firestore");
const { firestoreDb, runNextQuestion } = require("../firebase.js");

async function runCronJob() {
  const now = Timestamp.now();
  const snapshot = await getDocs(collection(firestoreDb, "quizzes"));
  let advanced = 0;

  for (const quizDoc of snapshot.docs) {
    const quiz = quizDoc.data();

    if (quiz.status !== "running" || !quiz.nextAt) continue;

    const nextAtMillis = quiz.nextAt.toMillis();
    const nowMillis = now.toMillis();

    if (nextAtMillis <= nowMillis) {
      const quizRef = doc(firestoreDb, "quizzes", quizDoc.id);
      await updateDoc(quizRef, { nextAt: null });
      console.log(`⏭️ Advancing quiz: ${quizDoc.id}`);
      await runNextQuestion(quiz.inline_message_id);
      advanced++;
    }
  }

  console.log(`✅ Advanced ${advanced} quizzes`);
  return { ok: true, advanced };
}
module.exports = runCronJob;
