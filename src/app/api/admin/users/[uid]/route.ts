import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET one user
export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ uid, ...snap.data() });
}

// PUT update user
export async function PUT(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  const data = await request.json();

  await updateDoc(doc(db, "users", uid), data);

  return NextResponse.json({ message: `User ${uid} updated` });
}

// DELETE user
export async function DELETE(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  await deleteDoc(doc(db, "users", uid));

  return NextResponse.json({ message: `User ${uid} deleted` });
}
