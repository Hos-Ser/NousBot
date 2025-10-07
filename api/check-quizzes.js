import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { firestoreDb, runNextQuestion } from "../controller/lib/firebase.js";

export default async function handler(req, res) {
  try {
    const now = Timestamp.now();
    const snapshot = await getDocs(collection(firestoreDb, "quizzes"));
    let advanced = 0;

    for (const quizDoc of snapshot.docs) {
      const quiz = quizDoc.data();

      // Only process active quizzes
      if (quiz.status !== "running" || !quiz.nextAt) continue;

      const nextAtMillis = quiz.nextAt.toMillis();
      const nowMillis = now.toMillis();

      if (nextAtMillis <= nowMillis) {
        // Guard to prevent double runs
        const quizRef = doc(firestoreDb, "quizzes", quizDoc.id);

        // Reset nextAt to avoid immediate re-trigger
        await updateDoc(quizRef, { nextAt: null });

        console.log(`⏭️ Advancing quiz: ${quizDoc.id} (${quiz.subject})`);
        await runNextQuestion(quiz.inline_message_id);
        advanced++;
      }
    }

    console.log(
      `✅ Cron ran at ${new Date().toISOString()}, advanced ${advanced} quizzes.`
    );
    res.status(200).json({ ok: true, advanced });
  } catch (err) {
    console.error("❌ Error in /api/check-quizzes:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
