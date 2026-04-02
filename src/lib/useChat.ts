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
  timestamp: Date | null;
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
        return {
          id: d.id,
          text: data.text || "",
          originalText: data.originalText || data.text || "",
          translatedText: data.translatedText || null,
          sender: data.sender || "Unknown",
          uid: data.uid || "",
          photoURL: data.photoURL || null,
          timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date(),
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
    numberBase: number
  ) => {
    try {
      await addDoc(collection(db, "messages"), {
        text, // Used as fallback
        originalText,
        translatedText,
        sender: displayName,
        uid,
        photoURL,
        timestamp: serverTimestamp(),
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
