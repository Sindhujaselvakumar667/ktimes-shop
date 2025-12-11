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

// Update order status
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing order ID or status" }, { status: 400 });
    }

    await db.collection("orders").doc(id).update({ status });
    return NextResponse.json({ message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Delete order
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }
        await db.collection("orders").doc(id).delete();
        return NextResponse.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}