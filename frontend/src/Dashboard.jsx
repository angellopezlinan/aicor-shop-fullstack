import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Utilidad para formato de moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function Dashboard() {
    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState("orders");
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [products, setProducts] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "", price: "", stock: "", image: "", description: ""
    });

    // 1. LÓGICA DE CARGA OPTIMIZADA (useCallback para evitar re-renders)
    const loadData = useCallback(async () => {
        try {
            // No hacemos setLoading(true) aquí para evitar error de linter "setState in Effect"
            // Asumimos que la carga inicial ya tiene loading=true
            const [ordersRes, productsRes] = await Promise.all([
                axios.get("/api/orders"),
                axios.get("/api/products")
            ]);

            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            
            const revenue = ordersRes.data.reduce((acc, order) => acc + parseFloat(order.total), 0);
            setStats({ totalOrders: ordersRes.data.length, totalRevenue: revenue });
        } catch {
            // Fallo silencioso, el usuario verá la tabla vacía o reintentará
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. EFECTO INICIAL
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- MANEJADORES ---

    const handleOpenProductModal = (product = null) => {
        setEditingProduct(product);
        setFormData(product ? {
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image || "",
            description: product.description || ""
        } : { name: "", price: "", stock: "", image: "", description: "" });
        
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, formData);
            } else {
                await axios.post("/api/products", formData);
            }
            setIsProductModalOpen(false);
            await loadData();
        } catch {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Confirmar eliminación?")) return;
        try {
            setLoading(true);
            await axios.delete(`/api/products/${id}`);
            await loadData();
        } catch {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                    <p className="text-gray-500">Gestión integral de la tienda</p>
                </div>
                <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-bold transition">
                    ← Ir a la Tienda
                </Link>
            </header>

            <div className="flex space-x-6 mb-6 border-b border-gray-300">
                <TabButton label="📦 Pedidos" isActive={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                <TabButton label="🏷️ Inventario" isActive={activeTab === "products"} onClick={() => setActiveTab("products")} />
            </div>

            {activeTab === "orders" && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <KpiCard icon="💰" title="Ingresos Totales" value={formatCurrency(stats.totalRevenue)} color="green" />
                        <KpiCard icon="📦" title="Ventas Totales" value={stats.totalOrders} color="blue" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-4">Ref</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-mono text-indigo-600 font-bold">#{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{order.user?.name || "Eliminado"}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="p-4"><Badge status={order.status} /></td>
                                        <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(order.total)}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1 rounded-full">Ver Detalles</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "products" && (
                <div className="animate-fade-in">
                    <div className="flex justify-end mb-6">
                        <button onClick={() => handleOpenProductModal()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">+ Nuevo Producto</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4 text-right">Precio</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            {product.image && <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-gray-100 border border-gray-200"/>}
                                            <span className="font-bold text-gray-900">{product.name}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{product.stock} un.</span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(product.price)}</td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => handleOpenProductModal(product)} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-2 py-1 rounded">Editar</button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Borrar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            
            {isProductModalOpen && <ProductFormModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSubmit={handleSaveProduct} initialData={formData} setFormData={setFormData} isEditing={!!editingProduct} />}
        </div>
    );
}

// --- SUBCOMPONENTES ---

const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`pb-2 px-4 font-bold text-lg transition-all ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>{label}</button>
);

const Badge = ({ status }) => (
    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">{status}</span>
);

const KpiCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
        <div className={`p-4 bg-${color}-100 rounded-full text-${color}-600 mr-4 text-2xl`}>{icon}</div>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
    </div>
);

const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Pedido #{order.id}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6">
                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-bold uppercase">Cliente</p>
                    <p className="font-bold text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-600">{order.user?.email}</p>
                </div>
                <ul className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto pr-2">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div><p className="font-bold text-gray-800 text-sm">{item.product?.name}</p><p className="text-xs text-gray-500">x{item.quantity}</p></div>
                            <p className="font-mono font-bold text-indigo-600 text-sm">{formatCurrency(item.price)}</p>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Total</span><span className="text-2xl font-extrabold text-indigo-600">{formatCurrency(order.total)}</span>
                </div>
            </div>
        </div>
    </div>
);

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData, setFormData, isEditing }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-600 p-5 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">{isEditing ? "Editar" : "Nuevo"}</h3>
                    <button onClick={onClose} className="text-white font-bold text-xl">&times;</button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <input type="text" placeholder="Nombre" required className="w-full bg-gray-50 border rounded-lg p-3" value={initialData.name} onChange={e => setFormData({...initialData, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.01" placeholder="Precio" required className="w-full bg-gray-50 border rounded-lg p-3" value={initialData.price} onChange={e => setFormData({...initialData, price: e.target.value})} />
                        <input type="number" placeholder="Stock" required className="w-full bg-gray-50 border rounded-lg p-3" value={initialData.stock} onChange={e => setFormData({...initialData, stock: e.target.value})} />
                    </div>
                    <input type="text" placeholder="URL Imagen" className="w-full bg-gray-50 border rounded-lg p-3" value={initialData.image} onChange={e => setFormData({...initialData, image: e.target.value})} />
                    <textarea placeholder="Descripción" className="w-full bg-gray-50 border rounded-lg p-3 h-24" value={initialData.description} onChange={e => setFormData({...initialData, description: e.target.value})} />
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Guardar</button>
                </form>
            </div>
        </div>
    );
};