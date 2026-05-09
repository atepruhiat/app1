import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Trash2, X, Save, Box, Tag, DollarSign, List as ListIcon, Search, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  noProduk: string;
  namaProduk: string;
  kategori: string;
  stok: number;
  hargaBeli: number;
  hargaJual: number;
}

const INITIAL_FORM_STATE = {
  noProduk: '',
  namaProduk: '',
  kategori: 'Elektronik',
  stok: '',
  hargaBeli: '',
  hargaJual: '',
};

const CATEGORIES = ['Elektronik', 'Pakaian', 'Makanan', 'Alat Kantor', 'Hobi', 'Kesehatan'];

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const formatInputCurrency = (value: string) => {
    // Remove all non-digits
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    // Format with dots
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseInputCurrency = (value: string) => {
    return Number(value.replace(/\./g, '')) || 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'hargaBeli' || name === 'hargaJual') {
      setFormData((prev) => ({ ...prev, [name]: formatInputCurrency(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaProduk) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      noProduk: formData.noProduk || `PRD-${Date.now().toString().slice(-4)}`,
      namaProduk: formData.namaProduk,
      kategori: formData.kategori,
      stok: Number(formData.stok) || 0,
      hargaBeli: parseInputCurrency(formData.hargaBeli),
      hargaJual: parseInputCurrency(formData.hargaJual),
    };

    setProducts((prev) => [newProduct, ...prev]);
    setFormData(INITIAL_FORM_STATE);
    
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleBatal = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.noProduk.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalStockValue = products.reduce((acc, p) => acc + (p.stok * p.hargaBeli), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 flex flex-col font-sans overflow-x-hidden">
      <div className="max-w-[1280px] mx-auto w-full flex flex-col flex-grow">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">STOKPRO <span className="text-blue-600">.</span></h1>
            <p className="text-slate-500 font-medium">Sistem Manajemen Inventaris Produk</p>
          </div>
          <div className="text-left md:text-right hidden sm:block text-slate-400">
            <p className="text-xs font-bold uppercase tracking-widest ">Sesi Aktif</p>
            <p className="text-sm font-semibold text-slate-600">Administrator Utama</p>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 flex-grow">
          
          {/* Main Form Card: Bento Large */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] border-4 border-slate-200 p-8 md:p-10 flex flex-col shadow-2xl shadow-slate-200/50 relative"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold">Input Data Produk Baru</h2>
            </div>

            <form onSubmit={handleSimpan} className="flex flex-col flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 flex-grow">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nomor Produk</label>
                  <input 
                    type="text" 
                    name="noProduk"
                    value={formData.noProduk}
                    onChange={handleInputChange}
                    placeholder="PRD-XXXX (Auto jika kosong)"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-mono text-lg outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nama Produk</label>
                  <input 
                    type="text" 
                    name="namaProduk"
                    value={formData.namaProduk}
                    onChange={handleInputChange}
                    placeholder="Contoh: Laptop Ultrabook Pro" 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 text-lg outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Kategori Produk</label>
                  <select 
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 text-lg outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Stok Tersedia</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="stok"
                      value={formData.stok}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 text-lg outline-none transition-all"
                    />
                    <span className="absolute right-6 top-4.5 text-slate-400 font-medium">Unit</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Harga Beli (Satuan)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-4.5 text-slate-400 font-bold">Rp</span>
                    <input 
                      type="text" 
                      name="hargaBeli"
                      value={formData.hargaBeli}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-lg outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Harga Jual (Satuan)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-4.5 text-slate-400 font-bold">Rp</span>
                    <input 
                      type="text" 
                      name="hargaJual"
                      value={formData.hargaJual}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-lg outline-none transition-all font-semibold text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-5 rounded-3xl text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <Save size={24} /> SIMPAN DATA
                </button>
                <button 
                  type="button"
                  onClick={handleBatal}
                  className="px-12 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold py-5 rounded-3xl text-xl transition-all cursor-pointer"
                >
                  BATAL
                </button>
              </div>
            </form>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-10 right-10 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-green-100 flex items-center gap-2"
                >
                   Data Berhasil Disimpan
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Summary Stat: Bento Medium */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-[2.5rem] p-8 text-white flex flex-col justify-between min-h-[220px]"
            >
              <div className="flex justify-between items-start">
                <div className="bg-slate-700/50 p-4 rounded-3xl">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black bg-blue-500 text-white px-3 py-1 rounded-full">{products.length} PRODUK</span>
                  <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Total Produk Aktif</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Estimasi Nilai Stok</p>
                <h3 className="text-3xl md:text-4xl font-black mt-2 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                  {formatCurrency(totalStockValue).replace(',00', '')}
                </h3>
              </div>
            </motion.div>

            {/* Quick Stats: Bento Small */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-center min-h-[140px] shadow-xl shadow-blue-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Unit Terdaftar</p>
                  <p className="text-3xl font-black">{products.reduce((acc, p) => acc + (p.stok || 0), 0)} Unit</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* List Section: Wide Bottom Bento */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 bg-white rounded-[2.5rem] border-4 border-slate-200 p-8 md:p-10 flex flex-col shadow-xl shadow-slate-100"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-slate-800 rounded-full"></div>
                <h2 className="text-2xl font-bold">Daftar Inventaris Lengkap</h2>
              </div>
              
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Cari nama atau nomor produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-slate-400 text-xs font-bold uppercase tracking-widest px-6 italic">
                    <th className="pb-3 pl-8">No Produk</th>
                    <th className="pb-3 px-6">Informasi Produk</th>
                    <th className="pb-3 px-6 text-center">Stok</th>
                    <th className="pb-3 px-6 text-right">Harga Beli</th>
                    <th className="pb-3 px-6 text-right">Harga Jual</th>
                    <th className="pb-3 pr-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 text-xs md:text-sm">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.length === 0 ? (
                      <motion.tr layout initial={{ opacity: 0 }}>
                        <td colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-300">
                             <AlertCircle size={48} strokeWidth={1.5} />
                             <p className="font-bold text-xl italic">Data tidak ditemukan</p>
                          </div>
                        </td>
                      </motion.tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          layout
                          className="group bg-slate-50 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-default"
                        >
                          <td className="py-6 pl-8 rounded-l-[1.5rem] font-mono text-xs font-bold text-slate-500 border-y-2 border-l-2 border-slate-100 group-hover:border-blue-100">
                            {p.noProduk}
                          </td>
                          <td className="py-6 px-6 border-y-2 border-slate-100 group-hover:border-blue-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-800 font-black text-lg shadow-sm">
                                {p.namaProduk.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 leading-none">{p.namaProduk}</p>
                                <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tighter mt-1 block">{p.kategori}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 text-center border-y-2 border-slate-100 group-hover:border-blue-100">
                            <span className={`px-4 py-1.5 rounded-xl font-black text-sm ${p.stok > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                              {p.stok} <span className="text-[10px] opacity-70">UNIT</span>
                            </span>
                          </td>
                          <td className="py-6 px-6 text-right font-bold text-slate-500 border-y-2 border-slate-100 group-hover:border-blue-100">
                            {formatCurrency(p.hargaBeli).replace(',00', '')}
                          </td>
                          <td className="py-6 px-6 text-right font-black text-blue-600 border-y-2 border-slate-100 group-hover:border-blue-100">
                            {formatCurrency(p.hargaJual).replace(',00', '')}
                          </td>
                          <td className="py-6 pr-8 rounded-r-[1.5rem] text-right border-y-2 border-r-2 border-slate-100 group-hover:border-blue-100">
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Bottom Banner: Bento Small */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 bg-blue-50 rounded-3xl flex flex-col md:flex-row items-center justify-between px-10 py-6 border-2 border-blue-100 gap-4"
          >
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500"></div>
                <span className="text-sm font-bold text-slate-700 tracking-tight">Status: Sistem Siap Input</span>
              </div>
              <div className="hidden md:block h-6 w-[1px] bg-blue-200"></div>
              <p className="text-sm text-blue-800/60 font-black tracking-widest uppercase">STOKPRO CORE v3.0</p>
            </div>
            <p className="text-sm text-slate-400 font-medium italic">
              Tip: Gunakan titik sebagai pemisah ribuan otomatis saat mengetik harga.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
