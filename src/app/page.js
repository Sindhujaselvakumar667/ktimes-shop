"use client";
import { useState, useEffect, useRef } from "react";
import { categoryIcons } from "@/data/categoryIcons";

const ProductSkeleton = () => (
    <div className="bg-[#1c1c1c] rounded-xl p-3 shadow-lg border border-[#333] animate-pulse">
        <div className="w-full h-28 bg-[#333] rounded"></div>
        <div className="h-4 bg-[#333] rounded mt-2 w-3/4"></div>
        <div className="h-3 bg-[#333] rounded mt-1 w-1/2"></div>
        <div className="h-5 bg-[#333] rounded mt-1 w-1/4"></div>
        <div className="h-8 bg-[#333] rounded mt-2 w-full"></div>
    </div>
);

const QuantityStepper = ({ itemId, onUpdate, currentQty }) => {
    const handleIncrement = () => {
        onUpdate(itemId, currentQty + 1);
    };

    const handleDecrement = () => {
        onUpdate(itemId, currentQty - 1);
    };

    const handleChange = (e) => {
        onUpdate(itemId, Math.max(0, parseInt(e.target.value) || 0));
    };

    if (currentQty === 0) {
        return (
            <button
                className="w-full border border-[#d4af37] text-[#d4af37] px-3 py-1 rounded hover:bg-[#d4af37] hover:text-black transition"
                onClick={handleIncrement}
            >
                Add to Cart
            </button>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <button onClick={handleDecrement} className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full">-</button>
            <input
                type="number"
                min="0"
                value={currentQty}
                onChange={handleChange}
                className="w-12 text-center bg-transparent border-x-0 border-y-2 border-y-[#444] text-white"
            />
            <button onClick={handleIncrement} className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full">+</button>
        </div>
    );
};

const ProductCard = ({ product, updateCartQty, itemInCart }) => {
    const currentQty = itemInCart ? itemInCart.qty : 0;

    return (
        <div className="bg-[#1c1c1c] rounded-xl p-3 shadow-lg border border-[#333] flex flex-col justify-between">
            <div>
                <img
                    src={product.imageUrl || `https://placehold.co/400x400/1c1c1c/d4af37?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    className="w-full h-28 object-cover rounded bg-[#333]"
                />
                <h3 className="font-semibold mt-2">{product.name}</h3>
                <p className="text-sm text-gray-400 capitalize">
                    {product.category}
                </p>
                <p className="font-bold mt-1 text-[#d4af37]">
                    ₹{product.price}
                </p>
            </div>
            <div className="mt-2">
                <QuantityStepper
                    itemId={product.id}
                    onUpdate={updateCartQty}
                    currentQty={currentQty}
                />
            </div>
        </div>
    );
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("clock");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, message: "" });
  const cartRef = useRef(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        setIsPageLoading(true);
        await Promise.all([loadProducts(), loadCategories()]);
        setIsPageLoading(false);
    };
    loadData();
  }, []);

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  const filteredProducts = products
    .filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const updateQty = (id, qty) => {
    if (qty < 0) return;
    setCart((items) => {
        if (qty === 0) {
            return items.filter(i => i.id !== id);
        }
        const exists = items.find((i) => i.id === id);
        if (exists) {
            return items.map((i) => (i.id === id ? { ...i, qty } : i));
        } else {
            const product = products.find(p => p.id === id);
            if (product) {
                return [...items, { ...product, qty }];
            }
        }
        return items;
    });
  };

  const placeOrder = async () => {
    if (!customerName) {
      setModalState({ isOpen: true, message: "Please enter your name" });
      return;
    }

    setIsPlacingOrder(true);
    try {
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
          setModalState({ isOpen: true, message: "Order placed successfully!" });
          setCart([]);
          setCustomerName("");
          setPhone("");
          setNote("");
        } else {
          setModalState({ isOpen: true, message: "Order failed!" });
        }
    } catch (error) {
        setModalState({ isOpen: true, message: "An unexpected error occurred." });
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const Modal = ({ state, setState }) => {
    const { isOpen, message } = state;
    if (!isOpen) return null;

    const handleClose = () => {
        setState({ isOpen: false, message: "" });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#333] w-full max-w-sm text-white">
                <p className="mb-4">{message}</p>
                <div className="flex justify-end">
                    <button onClick={handleClose} className="bg-[#d4af37] text-black px-4 py-2 rounded">OK</button>
                </div>
            </div>
        </div>
    );
  };

  const handleCartClick = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <Modal state={modalState} setState={setModalState} />

      {/* HEADER */}
      <header className="bg-[#111] p-4 flex justify-between items-center border-b border-[#444] sticky top-0 z-20">
        <div className="w-1/3">
          {/* Empty div for spacing */}
        </div>
        <div className="w-1/3 flex justify-center">
            <img
              src="/logo.png"
              alt="KTIMES Logo"
              className="h-20 object-contain"
            />
        </div>
        <div className="w-1/3 flex justify-end">
          <div className="relative cursor-pointer" onClick={handleCartClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.44a1.125 1.125 0 00-.142-1.087l-3.232-4.21a.75.75 0 00-.91-.257l-4.244 1.766M7.5 14.25L5.106 5.165m0 0a3.375 3.375 0 01-3.375-3.375h.008c1.865 0 3.375 1.51 3.375 3.375z" />
              </svg>
              {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
              )}
          </div>
        </div>
      </header>

      {/* CATEGORY MENU */}
      <div className="bg-[#1a1a1a] p-2 flex gap-3 overflow-x-auto sticky top-0 z-10 border-b border-[#333]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name.toLowerCase())}
            className={`px-3 py-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors duration-200 border-b-2 ${selectedCategory === cat.name.toLowerCase()
                ? "border-[#d4af37] text-[#d4af37]"
                : "border-transparent text-gray-400 hover:text-white"
              }`}
          >
            <span className="text-lg">
              {categoryIcons[cat.name.toLowerCase()] || "📦"}
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
            {categories.find((c) => c.name.toLowerCase() === selectedCategory)?.name}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isPageLoading ? (
                Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                    const itemInCart = cart.find(item => item.id === p.id);
                    return (
                        <ProductCard
                            key={p.id}
                            product={p}
                            updateCartQty={updateQty}
                            itemInCart={itemInCart}
                        />
                    )
                })
            ) : (
                <p className="text-sm text-gray-400">No products found</p>
            )}
          </div>
        </section>

        {/* CART */}
        <section ref={cartRef} className="bg-[#1c1c1c] p-4 rounded-xl shadow border border-[#333]">
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
              placeholder="Phone Number (Optional)"
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
            className="mt-3 w-full bg-[#d4af37] text-black py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            disabled={cart.length === 0 || isPlacingOrder}
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>

        </section>

      </main>
    </div>
  );
}