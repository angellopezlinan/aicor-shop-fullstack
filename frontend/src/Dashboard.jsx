import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
    // --- ESTADOS GLOBALES ---
    const [activeTab, setActiveTab] = useState("orders"); // 'orders' o 'products'
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE PEDIDOS ---
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null); // Modal de pedidos

    // --- ESTADOS DE PRODUCTOS ---
    const [products, setProducts] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false); // Modal de productos
    const [editingProduct, setEditingProduct] = useState(null); // Producto a editar
    const [formData, setFormData] = useState({
        name: "", price: "", stock: "", image: "", description: ""
    });

    // 1. CARGA INICIAL (Pedidos y Productos)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Cargar Pedidos
            const ordersRes = await axios.get("/api/orders");
            setOrders(ordersRes.data);
            
            // Calcular Estadísticas
            const revenue = ordersRes.data.reduce((acc, order) => acc + parseFloat(order.total), 0);
            setStats({ totalOrders: ordersRes.data.length, totalRevenue: revenue });

            // Cargar Productos
            const productsRes = await axios.get("/api/products");
            setProducts(productsRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error cargando datos:", error);
            setLoading(false);
        }
    };

    // --- LÓGICA DE PRODUCTOS ---

    const handleOpenProductModal = (product = null) => {
        if (product) {
            // Modo Edición
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                stock: product.stock,
                image: product.image || "",
                description: product.description || ""
            });
        } else {
            // Modo Creación
            setEditingProduct(null);
            setFormData({ name: "", price: "", stock: "", image: "", description: "" });
        }
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                // ACTUALIZAR (PUT)
                await axios.put(`/api/products/${editingProduct.id}`, formData);
                alert("Producto actualizado correctamente");
            } else {
                // CREAR (POST)
                await axios.post("/api/products", formData);
                alert("Producto creado correctamente");
            }
            setIsProductModalOpen(false);
            fetchData(); // Recargar tablas
        } catch (error) {
            console.error("Error guardando producto:", error);
            alert("Error al guardar. Revisa los datos.");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
        
        try {
            await axios.delete(`/api/products/${id}`);
            fetchData(); // Recargar tabla
        } catch (error) {
            console.error("Error eliminando:", error);
            alert("No se pudo eliminar el producto.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            
            {/* ENCABEZADO Y NAVEGACIÓN */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                    <p className="text-gray-500">Gestión integral de la tienda</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-bold transition">
                        ← Ir a la Tienda
                    </Link>
                </div>
            </div>

            {/* PESTAÑAS (TABS) */}
            <div className="flex space-x-4 mb-6 border-b border-gray-300 pb-1">
                <button 
                    onClick={() => setActiveTab("orders")}
                    className={`pb-2 px-4 font-bold text-lg transition-colors ${activeTab === 'orders' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📦 Pedidos
                </button>
                <button 
                    onClick={() => setActiveTab("products")}
                    className={`pb-2 px-4 font-bold text-lg transition-colors ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🏷️ Inventario
                </button>
            </div>

            {/* --- CONTENIDO DE LA PESTAÑA: PEDIDOS --- */}
            {activeTab === "orders" && (
                <div className="animate-fade-in">
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                            <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4 text-2xl">💰</div>
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase">Ingresos Totales</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4 text-2xl">📦</div>
                            <div>
                                <p className="text-gray-500 text-sm font-bold uppercase">Ventas Totales</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    {/* TABLA PEDIDOS */}
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
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-indigo-600 font-bold">#{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{order.user?.name || "Borrado"}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:underline font-bold">Ver Detalles</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- CONTENIDO DE LA PESTAÑA: PRODUCTOS --- */}
            {activeTab === "products" && (
                <div className="animate-fade-in">
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => handleOpenProductModal()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                        >
                            + Nuevo Producto
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Imagen</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4 text-right">Precio</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">#{product.id}</td>
                                        <td className="p-4">
                                            {product.image && (
                                                <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-gray-100"/>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">{product.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {product.stock} un.
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => handleOpenProductModal(product)} className="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 font-bold">Borrar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- MODAL 1: DETALLE DE PEDIDO --- */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
                            <h3 className="font-bold text-lg">Pedido #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-2xl font-bold text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">Cliente: <span className="font-bold text-gray-800">{selectedOrder.user?.name}</span></p>
                            <ul className="space-y-4 max-h-[50vh] overflow-y-auto">
                                {selectedOrder.items.map(item => (
                                    <li key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.product?.name || "Producto Eliminado"}</p>
                                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                                        </div>
                                        <p className="font-mono font-bold text-indigo-600">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 text-right text-xl font-bold border-t pt-4">
                                Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedOrder.total)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: CREAR/EDITAR PRODUCTO --- */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">
                                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                            </h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-white font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                <input 
                                    type="text" required
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio (€)</label>
                                    <input 
                                        type="number" step="0.01" required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                                    <input 
                                        type="number" required
                                        className="w-full border rounded-lg p-2"
                                        value={formData.stock}
                                        onChange={e => setFormData({...formData, stock: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">URL Imagen</label>
                                <input 
                                    type="text" placeholder="https://..."
                                    className="w-full border rounded-lg p-2"
                                    value={formData.image}
                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea 
                                    className="w-full border rounded-lg p-2 h-20"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}