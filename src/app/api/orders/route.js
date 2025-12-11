import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// CREATE ORDER
export async function POST(req) {
  const body = await req.json();

  const docRef = await db.collection("orders").add({
    customerName: body.customerName,
    phone: body.phone,
    note: body.note || "",
    items: body.items,
    status: "pending",
    createdAt: Date.now()
  });

  return NextResponse.json({ id: docRef.id });
}

// LIST ORDERS
export async function GET() {
  console.log("GET ORDERS");
  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();
  

  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(orders);
}
