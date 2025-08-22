import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";

type Context = {
  params: { uid: string };
};

// DELETE: Archive user
export async function DELETE(req: NextRequest, context: Context) {
  const { uid } = context.params;

  try {
    const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminUserDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (adminUserDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await admin.firestore().collection("users").doc(uid).update({
      status: "archived",
    });

    await admin.auth().updateUser(uid, { disabled: true });

    return NextResponse.json({ message: "User archived successfully" });
  } catch (error) {
    console.error("Error archiving user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Restore user
export async function PUT(req: NextRequest, context: Context) {
  const { uid } = context.params;

  try {
    const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminUserDoc = await admin
      .firestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (adminUserDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await admin.firestore().collection("users").doc(uid).update({
      status: "active",
    });

    await admin.auth().updateUser(uid, { disabled: false });

    return NextResponse.json({ message: "User restored successfully" });
  } catch (error) {
    console.error("Error restoring user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
