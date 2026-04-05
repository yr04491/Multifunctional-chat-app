import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export type UserProfile = {
  displayName: string;
  avatar: string;
};

export const PRESET_AVATARS = [
  "/araiguma.png",
  "/cheetah.png",
  "/duck.png",
  "/kangaroo.png",
  "/zou.png"
];

export function useUserProfile(currentUser: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // デフォルトの初期値
        setProfile({
          displayName: currentUser.displayName || "User",
          avatar: PRESET_AVATARS[0]
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateProfile = async (displayName: string, avatar: string) => {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    await setDoc(docRef, { displayName, avatar }, { merge: true });
  };

  return { profile, loading, updateProfile };
}
