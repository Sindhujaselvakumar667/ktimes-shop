import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// GET ALL PRODUCTS
export async function GET() {
  const snapshot = await db.collection("products").get();
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(products);
}

// CREATE PRODUCT
export async function POST(req) {
  const body = await req.json();

  const docRef = await db.collection("products").add({
    name: body.name,
    price: Number(body.price),
    category: body.category,
    imageUrl: body.imageUrl || "",
    createdAt: Date.now()
  });

  return NextResponse.json({ id: docRef.id });
}
