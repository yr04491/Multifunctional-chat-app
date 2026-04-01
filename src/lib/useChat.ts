import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date | null;
  isEdited: boolean;
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
          text: data.text,
          sender: data.sender,
          // nullが来る可能性をハンドリング (送信直後など)
          timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : new Date(),
          isEdited: data.isEdited || false,
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // 新規メッセージの送信
  const sendMessage = async (text: string, sender: string) => {
    try {
      await addDoc(collection(db, "messages"), {
        text,
        sender,
        timestamp: serverTimestamp(),
        isEdited: false,
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
