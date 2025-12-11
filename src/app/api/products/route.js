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

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.get('host')}`);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db.collection("products").doc(id).delete();

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.get('host')}`);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { name, price, category, imageUrl } = body;
    if (!name || !price || !category) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.collection("products").doc(id).update({
        name,
        price: Number(price),
        category,
        imageUrl: imageUrl,
    });

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

