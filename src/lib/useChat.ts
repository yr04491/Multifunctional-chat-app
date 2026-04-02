import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type Message = {
  id: string;
  originalText: string;
  translatedText: string | null;
  text: string; // Maintain for backward compatibility for older messages without originalText
  sender: string;       // 表示名
  uid: string;          // アカウント固有ID
  photoURL: string | null;  // アイコンURL
  timestamp: Date | null;  // 送信時刻（sentAt）
  revealAt: Date | null;   // 表示解禁時刻（timestamp + delay）
  delayMinutes: number;    // 遅延分数（0=即時）
  isEdited: boolean;
  isTranslationEnabled: boolean;
  translationLanguage?: string;
  isNumberConversionEnabled: boolean;
  numberBase?: number;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 古い順に取得（チャットログの標準的な並び）
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
    // Firestoreのリアルタイムリスナーを開始
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => {
        const data = d.data();
        const sentAt = data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date();
        const delayMinutes: number = data.delayMinutes || 0;
        const revealAt: Date = data.revealAt
          ? (data.revealAt as Timestamp).toDate()
          : sentAt;
        return {
          id: d.id,
          text: data.text || "",
          originalText: data.originalText || data.text || "",
          translatedText: data.translatedText || null,
          sender: data.sender || "Unknown",
          uid: data.uid || "",
          photoURL: data.photoURL || null,
          timestamp: sentAt,
          revealAt,
          delayMinutes,
          isEdited: data.isEdited || false,
          isTranslationEnabled: data.isTranslationEnabled || false,
          translationLanguage: data.translationLanguage || "en",
          isNumberConversionEnabled: data.isNumberConversionEnabled || false,
          numberBase: data.numberBase || 2,
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // 新規メッセージの送信
  const sendMessage = async (
    text: string, 
    uid: string, 
    displayName: string, 
    photoURL: string | null, 
    originalText: string, 
    translatedText: string | null, 
    isTranslationEnabled: boolean,
    translationLanguage: string,
    isNumberConversionEnabled: boolean,
    numberBase: number,
    delayMinutes: number
  ) => {
    try {
      // 遅延時間を計算してrevealAtをセット
      const now = new Date();
      const revealAt = new Date(now.getTime() + delayMinutes * 60 * 1000);
      
      await addDoc(collection(db, "messages"), {
        text, // Used as fallback
        originalText,
        translatedText,
        sender: displayName,
        uid,
        photoURL,
        timestamp: serverTimestamp(),
        revealAt: Timestamp.fromDate(revealAt),
        delayMinutes,
        isEdited: false,
        isTranslationEnabled,
        translationLanguage,
        isNumberConversionEnabled,
        numberBase,
      });
    } catch (e) {
      console.error("メッセージ送信エラー:", e);
    }
  };

  // 自分のメッセージの編集
  const editMessage = async (id: string, newText: string) => {
    try {
      const msgRef = doc(db, "messages", id);
      await updateDoc(msgRef, {
        text: newText,
        isEdited: true,
      });
    } catch (e) {
      console.error("メッセージ編集エラー:", e);
    }
  };

  return { messages, sendMessage, editMessage };
}
