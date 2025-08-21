import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// GET: fetch all users
export async function GET() {
  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    const creationTimestamp = data.createdAt
      ? data.createdAt.toDate()
      : new Date();

    return {
      uid: doc.id,
      displayName: data.name || "No Name",
      email: data.email,
      creationTime: creationTimestamp.toLocaleDateString(),
    };
  });

  return NextResponse.json(users);
}
