"use client";

import { useState, useEffect } from "react";


export default function AdminPage() {
    const [products, setProducts] = useState([]);

    const loadProducts = async () => {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
    };

    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
    };

    useEffect(() => {
        loadProducts();
        loadOrders();   // ADD THIS
    }, []);
    const uploadToCloudinary = async (file) => {
        if (!file) return "";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset");   // your preset name

        const cloudName = "dx5hudjqi"; // change this

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();
        return data.secure_url; // <-- Cloudinary image URL
    };



    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "",
        imageUrl: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const createProduct = async () => {
        if (!form.name || !form.price || !form.category) {
            alert("All fields are required");
            return;
        }

        let imageUrl = "";

        if (form.imageFile) {
            imageUrl = await uploadToCloudinary(form.imageFile);
        }

        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: form.name,
                price: form.price,
                category: form.category,
                imageUrl: imageUrl,
            }),
        });

        if (res.ok) {
            alert("Product added!");
            setForm({ name: "", price: "", category: "", imageUrl: "", imageFile: null });
            loadProducts();
        } else {
            alert("Error saving product");
        }
    };



    return (
        <div className="min-h-screen bg-[#111] text-white">

            {/* HEADER */}
            <header className="bg-[#111] p-4 flex justify-between items-center border-b border-[#333] sticky top-0 z-20">
                <img
                    src="/logo.png"
                    alt="KTIMES Logo"
                    className="h-14 object-contain"
                />

                <a
                    href="/"
                    className="text-[#d4af37] underline text-sm hover:opacity-80"
                >
                    Back to Shop
                </a>
            </header>

            {/* PAGE TITLE */}
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-[#d4af37]">Admin Panel</h1>
            </div>

            {/* MAIN GRID */}
            <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 gap-6">

                {/* ADD PRODUCT SECTION */}
                <section className="bg-[#1a1a1a] p-6 rounded-xl shadow border border-[#333]">
                    <h2 className="text-xl font-semibold text-[#d4af37] mb-4">
                        Add Product
                    </h2>

                    <div className="space-y-3 text-sm">
                        <input
                            name="name"
                            placeholder="Product Name"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                        />

                        <input
                            name="price"
                            placeholder="Price"
                            type="number"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                        />

                        <input
                            name="category"
                            placeholder="Category (clock, watch, etc.)"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                        />
                        <label className="text-sm text-gray-300">Product Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444]"
                            onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                        />

                        {form.imageFile && (
                            <img
                                src={URL.createObjectURL(form.imageFile)}
                                className="h-24 mt-2 rounded object-cover"
                            />
                        )}


                        {/* <input
                            name="imageUrl"
                            placeholder="Image URL (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                        /> */}

                        <button
                            onClick={createProduct}
                            className="w-full bg-[#d4af37] text-black py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Save Product
                        </button>
                    </div>

                    {/* EXISTING PRODUCTS */}
                    <h3 className="text-lg font-semibold text-[#d4af37] mt-6 mb-2">
                        Existing Products
                    </h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                        {products.map((p) => (
                            <div
                                key={p.id}
                                className="flex justify-between border-b border-[#333] pb-1"
                            >
                                <p>
                                    {p.name}{" "}
                                    <span className="text-gray-400">({p.category})</span>
                                </p>
                                <p className="text-[#d4af37] font-semibold">₹{p.price}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ORDERS SECTION */}
                <section className="bg-[#1a1a1a] p-6 rounded-xl shadow border border-[#333]">
                    <h2 className="text-xl font-semibold text-[#d4af37] mb-4">
                        Orders
                    </h2>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-sm">
                        {orders.map((o) => (
                            <div
                                key={o.id}
                                className="bg-[#222] rounded-lg p-4 border border-[#333]"
                            >
                                <p className="font-semibold text-[#d4af37]">
                                    {o.customerName} ({o.phone})
                                </p>

                                <p className="text-gray-400 text-xs">
                                    {new Date(o.createdAt).toLocaleString()}
                                </p>

                                <ul className="list-disc ml-4 mt-2 text-gray-300">
                                    {o.items.map((i, idx) => (
                                        <li key={idx}>
                                            {i.name} × {i.qty} ={" "}
                                            <span className="text-[#d4af37] font-semibold">
                                                ₹{i.qty * i.price}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {orders.length === 0 && (
                            <p className="text-gray-500">No orders found</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
