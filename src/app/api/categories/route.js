import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const snapshot = await db.collection("categories").orderBy("name").get();
  const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(categories);
}

// CREATE category
export async function POST(req) {
  const body = await req.json();

  const docRef = await db.collection("categories").add({
    name: body.name,
    createdAt: Date.now()
  });

  return NextResponse.json({ id: docRef.id });
}
