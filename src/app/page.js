"use client";

import { useState } from "react";
import { dummyProducts } from "@/data/dummyProducts";
import { categories } from "@/data/dummyCategories";
import { categoryIcons } from "@/data/categoryIcons";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("clock");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const filteredProducts = dummyProducts
    .filter((p) => p.category === selectedCategory)
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  const addToCart = (product) => {
    setCart((old) => {
      const exists = old.find((i) => i.id === product.id);
      if (exists) {
        return old.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...old, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart((items) => items.filter((i) => i.id !== id));
    } else {
      setCart((items) =>
        items.map((i) => (i.id === id ? { ...i, qty } : i))
      );
    }
  };
  const placeOrder = async () => {
    if (!customerName || !phone) {
      alert("Please enter your name and phone");
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        note,
        items: cart
      })
    });

    if (res.ok) {
      alert("Order placed successfully!");
      setCart([]);
      setCustomerName("");
      setPhone("");
      setNote("");
    } else {
      alert("Order failed!");
    }
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <div className="min-h-screen bg-[#111] text-white">

      {/* HEADER */}
      <header className="bg-[#111] p-4 flex justify-center border-b border-[#444]">
        <img
          src="/logo.png"
          alt="KTIMES Logo"
          className="h-16 object-contain"
        />
      </header>

      {/* CATEGORY MENU */}
      <div className="bg-[#1a1a1a] p-2 flex gap-3 overflow-x-auto sticky top-0 z-10 border-b border-[#333]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition ${selectedCategory === cat.id
              ? "bg-[#d4af37] text-black font-semibold" // gold theme
              : "bg-[#222]"
              }`}
          >
            <span className="text-lg">
              {categoryIcons[cat.id] || "📦"}
            </span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="p-4">
        <input
          className="w-full px-4 py-2 rounded-lg bg-[#222] border border-[#444] text-white focus:outline-none"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MAIN GRID */}
      <main className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">

        {/* PRODUCT LIST */}
        <section className="md:col-span-2">
          <h2 className="font-semibold mb-3 text-xl text-[#d4af37]">
            {categories.find((c) => c.id === selectedCategory)?.name}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#1c1c1c] rounded-xl p-3 shadow-lg hover:scale-105 transition cursor-pointer border border-[#333]"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-28 object-cover rounded bg-[#333]"
                />

                <h3 className="font-semibold mt-2">{p.name}</h3>
                <p className="text-sm text-gray-400 capitalize">
                  {p.category}
                </p>
                <p className="font-bold mt-1 text-[#d4af37]">
                  ₹{p.price}
                </p>

                <button
                  className="mt-2 w-full border border-[#d4af37] text-[#d4af37] px-3 py-1 rounded hover:bg-[#d4af37] hover:text-black transition"
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-400">No products found</p>
            )}
          </div>
        </section>

        {/* CART */}
        <section className="bg-[#1c1c1c] p-4 rounded-xl shadow border border-[#333]">
          <h2 className="font-semibold mb-2 text-lg text-[#d4af37]">
            Cart
          </h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">Cart is empty</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-400">
                      ₹{item.price} ×
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        className="border border-[#555] bg-[#111] w-12 ml-1 rounded text-center"
                        onChange={(e) =>
                          updateQty(item.id, parseInt(e.target.value))
                        }
                      />
                    </p>
                  </div>

                  <p className="font-semibold text-[#d4af37]">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 font-bold text-lg text-[#d4af37]">
            Total: ₹{total}
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <input
              placeholder="Your Name"
              className="w-full px-3 py-2 bg-[#111] border border-[#444] rounded text-white"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              placeholder="Phone Number"
              className="w-full px-3 py-2 bg-[#111] border border-[#444] rounded text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <textarea
              placeholder="Note (optional)"
              className="w-full px-3 py-2 bg-[#111] border border-[#444] rounded text-white"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>


          <button
            onClick={placeOrder}
            className="mt-3 w-full bg-[#d4af37] text-black py-2 rounded font-semibold hover:opacity-90"
          >
            Place Order
          </button>

        </section>

      </main>
    </div>
  );
}
