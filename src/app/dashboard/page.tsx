"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "../utils/auth";
import { supabase } from "../lib/supabase";

const IconPlus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
const IconPencil = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const IconX = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [namaProduk, setNamaProduk] = useState("");
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getSession();
    if (!currentUser) {
      router.push("/signin");
    } else {
      setUser(currentUser);
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select()
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const closeAndResetModal = () => {
    setEditingId(null);
    setNamaProduk("");
    setHargaSatuan("");
    setQuantity("");
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProduk || !hargaSatuan || !quantity) return;

    const productData = {
      nama_produk: namaProduk,
      harga_satuan: parseFloat(hargaSatuan),
      quantity: parseInt(quantity),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("products").insert([productData]));
    }

    if (!error) {
      
      closeAndResetModal();
      fetchProducts();
    } else {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        fetchProducts();
      }
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setNamaProduk("");
    setHargaSatuan("");
    setQuantity("");
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setNamaProduk(product.nama_produk);
    setHargaSatuan(product.harga_satuan.toString());
    setQuantity(product.quantity.toString());
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">
        Loading Session...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-50 mb-2 tracking-tight">
            Product Inventory
          </h1>
          <p className="text-slate-400">
            Welcome,{" "}
            <span className="text-green-400 font-semibold">
              {user?.username}
            </span>
          </p>
        </header>

        

        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-50">
            Available Products ({products.length})
          </h2>
          
          {user?.role === "admin" && (
            <button
              onClick={handleAddNew}
              className="flex items-center justify-center bg-green-600 text-slate-900 px-5 py-2 rounded-md font-bold hover:bg-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <IconPlus />
              Add Product
            </button>
          )}
        </div>

        
        {loading ? (
          <div className="text-center p-8 text-slate-400">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/10"
              >
                <div>
                  <h3 className="font-bold text-slate-50 text-lg mb-2 truncate">
                    {p.nama_produk}
                  </h3>
                  <div className="flex justify-between items-center text-slate-400 text-sm mb-4">
                    <p>
                      Price:{" "}
                      <span className="text-green-400 font-semibold">
                        Rp {p.harga_satuan.toLocaleString("id-ID")}
                      </span>
                    </p>
                    <p>
                      Qty:{" "}
                      <span className="text-slate-50 font-semibold">
                        {p.quantity}
                      </span>
                    </p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <div className="border-t border-slate-700 mt-4 pt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                    >
                      <IconPencil />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <IconTrash />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-800/50 border border-dashed border-slate-700 rounded-lg">
            <p className="text-slate-400">
              No products found. Please add a new product.
            </p>
          </div>
        )}
      </div>

      
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeAndResetModal} 
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()} 
          >
            
            <div className="flex justify-between items-center p-5 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-50">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeAndResetModal}
                className="text-slate-400 hover:text-slate-50"
              >
                <IconX />
              </button>
            </div>

            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={namaProduk}
                  onChange={(e) => setNamaProduk(e.target.value)}
                  className="w-full bg-slate-900 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-slate-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={hargaSatuan}
                  onChange={(e) => setHargaSatuan(e.target.value)}
                  className="w-full bg-slate-900 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-slate-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-900 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-slate-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="bg-slate-700 text-slate-300 px-6 py-2 rounded-md font-semibold hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center bg-green-600 text-slate-900 px-6 py-2 rounded-md font-bold hover:bg-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
