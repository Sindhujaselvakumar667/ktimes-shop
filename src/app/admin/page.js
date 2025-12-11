"use client";

import { useState, useEffect, useRef } from "react";


const StatusIcon = ({ status, className }) => {
    switch (status) {
        case 'completed':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            );
        case 'cancelled':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'pending':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return null;
    }
};

export default function AdminPage() {
    const emptyForm = {
        name: "",
        price: "",
        category: "",
        imageUrl: "",
        imageFile: null,
    };

    const [form, setForm] = useState(emptyForm);
    const fileInputRef = useRef(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, message: "", isConfirmation: false, onConfirm: null });
    const [categories, setCategories] = useState([]);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState('pending');
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

    const loadCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsPageLoading(true);
            await Promise.all([
                loadProducts(),
                loadOrders(),
                loadCategories()
            ]);
            setIsPageLoading(false);
        };
        loadData();
    }, []);

    const uploadToCloudinary = async (file) => {
        if (!file) return "";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset");
        const cloudName = "dx5hudjqi";
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl || "",
            imageFile: null,
        });
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setForm(emptyForm);
    };

    const handleSaveProduct = async () => {
        if (!form.name || !form.price || !form.category) {
            setModalState({ isOpen: true, message: "All fields are required" });
            return;
        }
        setIsSaving(true);

        let imageUrl = form.imageUrl || "";
        if (form.imageFile) {
            imageUrl = await uploadToCloudinary(form.imageFile);
        }

        const productData = { ...form, imageUrl };
        delete productData.imageFile;

        try {
            if (editingProduct) {
                const res = await fetch(`/api/products?id=${editingProduct.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData),
                });
                if (res.ok) {
                    setModalState({ isOpen: true, message: "Product updated!" });
                    setEditingProduct(null);
                    setForm(emptyForm);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    loadProducts();
                } else {
                    setModalState({ isOpen: true, message: "Error updating product" });
                }
            } else {
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                });
                if (res.ok) {
                    setModalState({ isOpen: true, message: "Product added!" });
                    setForm(emptyForm);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    loadProducts();
                } else {
                    setModalState({ isOpen: true, message: "Error saving product" });
                }
            }
        } catch (error) {
            setModalState({ isOpen: true, message: "An unexpected error occurred." });
        } finally {
            setIsSaving(false);
        }
    };

    const deleteProduct = async (productId) => {
        setModalState({ isOpen: false });
        const res = await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
        if (res.ok) {
            setModalState({ isOpen: true, message: "Product deleted!" });
            loadProducts();
        } else {
            setModalState({ isOpen: true, message: "Error deleting product" });
        }
    };

    const handleDeleteClick = (productId) => {
        setModalState({
            isOpen: true,
            message: "Are you sure you want to delete this product?",
            isConfirmation: true,
            onConfirm: () => deleteProduct(productId),
        });
    };

    const updateOrderStatus = async (orderId, status) => {
        setModalState({ isOpen: false });
        const res = await fetch(`/api/orders?id=${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            setModalState({ isOpen: true, message: 'Order status updated!' });
            loadOrders();
        } else {
            const err = await res.json();
            setModalState({ isOpen: true, message: `Error updating status: ${err.error}` });
        }
    };

    const deleteOrder = async (orderId) => {
        setModalState({ isOpen: false });
        const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
        if (res.ok) {
            setModalState({ isOpen: true, message: 'Order deleted!' });
            loadOrders();
        } else {
            setModalState({ isOpen: true, message: 'Error deleting order' });
        }
    };

    const handleDeleteOrderClick = (orderId) => {
        setModalState({
            isOpen: true,
            message: 'Are you sure you want to delete this order?',
            isConfirmation: true,
            onConfirm: () => deleteOrder(orderId),
        });
    };

    const orderStatuses = ['pending', 'completed', 'cancelled'];
    const filteredOrders = orders.filter(o => o.status === selectedOrderStatus);

    const Modal = ({ state, setState }) => {
        const { isOpen, message, isConfirmation, onConfirm } = state;
        if (!isOpen) return null;

        const handleConfirm = () => {
            if (onConfirm) onConfirm();
        };

        const handleClose = () => {
            setState({ isOpen: false, message: "", isConfirmation: false, onConfirm: null });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#333] w-full max-w-sm text-white">
                    <p className="mb-4">{message}</p>
                    <div className="flex justify-end gap-2">
                        {isConfirmation ? (
                            <>
                                <button onClick={handleClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                                <button onClick={handleConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
                            </>
                        ) : (
                            <button onClick={handleClose} className="bg-[#d4af37] text-black px-4 py-2 rounded">OK</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#d4af37]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111] text-white">
            <Modal state={modalState} setState={setModalState} />

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

                {/* ADD/EDIT PRODUCT SECTION */}
                <section className="bg-[#1a1a1a] p-6 rounded-xl shadow border border-[#333]">
                    <h2 className="text-xl font-semibold text-[#d4af37] mb-4">
                        {editingProduct ? "Edit Product" : "Add Product"}
                    </h2>

                    <div className="space-y-3 text-sm">
                        <input
                            name="name"
                            placeholder="Product Name"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                            value={form.name}
                        />

                        <input
                            name="price"
                            placeholder="Price"
                            type="number"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                            value={form.price}
                        />

                        <input
                            name="category"
                            placeholder="Category (clock, watch, etc.)"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444] text-white"
                            onChange={handleChange}
                            value={form.category}
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            {categories.map((c) => (
                                <option key={c.id} value={c.name} />
                            ))}
                        </datalist>

                        <label className="text-sm text-gray-300">Product Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="w-full px-3 py-2 rounded-lg bg-[#222] border border-[#444]"
                            onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                        />

                        {form.imageFile ? (
                            <img
                                src={URL.createObjectURL(form.imageFile)}
                                className="h-24 mt-2 rounded object-cover"
                            />
                        ) : form.imageUrl && (
                            <img
                                src={form.imageUrl}
                                className="h-24 mt-2 rounded object-cover"
                            />
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveProduct}
                                disabled={isSaving}
                                className="w-full bg-[#d4af37] text-black py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : (editingProduct ? "Update Product" : "Save Product")}
                            </button>
                            {editingProduct && (
                                <button
                                    onClick={cancelEdit}
                                    className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* EXISTING PRODUCTS */}
                    <h3 className="text-lg font-semibold text-[#d4af37] mt-6 mb-2">
                        Existing Products
                    </h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 text-sm">
                        {products.map((p) => (
                            <div
                                key={p.id}
                                className="flex justify-between items-center border-b border-[#333] pb-1"
                            >
                                <div>
                                    <p>
                                        {p.name}{" "}
                                        <span className="text-gray-400">({p.category})</span>
                                    </p>
                                    <p className="text-[#d4af37] font-semibold">₹{p.price}</p>
                                </div>
                                <div className="flex items-center">
                                    <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-white mr-2 p-1 hover:bg-gray-700 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleDeleteClick(p.id)} className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ORDERS SECTION */}
                <section className="bg-[#1a1a1a] p-6 rounded-xl shadow border border-[#333]">
                    <h2 className="text-xl font-semibold text-[#d4af37] mb-4">
                        Orders
                    </h2>

                    {/* Order Status Tabs */}
                    <div className="flex border-b border-gray-700 mb-4">
                        {orderStatuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedOrderStatus(status)}
                                className={`capitalize px-4 py-2 text-sm font-medium transition-colors ${selectedOrderStatus === status
                                    ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-sm">
                        {filteredOrders.map((o) => (
                            <div
                                key={o.id}
                                className="bg-[#222] rounded-lg p-4 border border-[#333]"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-[#d4af37]">
                                            {o.customerName} ({o.phone})
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(o.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <span title={o.status} className={`text-xs font-bold capitalize p-1 rounded-full ${o.status === 'pending' ? 'bg-yellow-500 text-black' : o.status === 'completed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            <StatusIcon status={o.status} className="w-4 h-4" />
                                        </span>
                                        <button onClick={() => handleDeleteOrderClick(o.id)} className="ml-2 text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

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
                                <div className="mt-2 flex gap-2 items-center">
                                    <span className="text-xs text-gray-400">Mark as:</span>
                                    {orderStatuses.filter(s => s !== o.status).map(s => (
                                        <button
                                            key={s}
                                            title={`Mark as ${s}`}
                                            onClick={() => updateOrderStatus(o.id, s)}
                                            className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full"
                                        >
                                            <StatusIcon status={s} className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredOrders.length === 0 && (
                            <p className="text-gray-500">No orders with status "{selectedOrderStatus}"</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
