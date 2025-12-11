import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// GET ALL PRODUCTS
export async function GET() {
  const snapshot = await db.collection("products").get();
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(products);
}

// CREATE PRODUCT
// CREATE PRODUCT + Auto add category
export async function POST(req) {
  const body = await req.json();

  const { name, price, category, imageUrl } = body;

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Save product
  const productRef = await db.collection("products").add({
    name,
    price: Number(price),
    category,
    imageUrl: imageUrl || "",
    createdAt: Date.now()
  });

  // 2. Check if category exists
  const categorySnapshot = await db
    .collection("categories")
    .where("name", "==", category)
    .get();

  // 3. If not found → create category
  if (categorySnapshot.empty) {
    await db.collection("categories").add({
      name: category,
      createdAt: Date.now()
    });
  }

  return NextResponse.json({ id: productRef.id });
}

