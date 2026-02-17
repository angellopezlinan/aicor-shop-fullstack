import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);
    
    // ESTADO PARA LA VENTANA MODAL
    const [selectedOrder, setSelectedOrder] = useState(null); // Guardará el pedido que estamos mirando

    useEffect(() => {
        axios.get("/api/orders")
            .then(response => {
                const data = response.data;
                setOrders(data);
                const revenue = data.reduce((acc, order) => acc + parseFloat(order.total), 0);
                setStats({ totalOrders: data.length, totalRevenue: revenue });
                setLoading(false);
            })
            .catch(error => {
                console.error("Error cargando dashboard:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative">
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                    <p className="text-gray-500">Gestión de pedidos y envíos</p>
                </div>
                <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
                    ← Volver a la Tienda
                </Link>
            </div>

            {/* TARJETAS KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4 text-2xl">💰</div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Ingresos</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4 text-2xl">📦</div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Ventas</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Últimos Pedidos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 font-semibold">Ref</th>
                                <th className="p-4 font-semibold">Cliente</th>
                                <th className="p-4 font-semibold">Estado</th>
                                <th className="p-4 font-semibold text-right">Total</th>
                                <th className="p-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-mono text-indigo-600 font-bold">#{order.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{order.user?.name || "Eliminado"}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status === 'paid' ? 'Pagado' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-900">
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
                                        >
                                            Ver Productos
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🔽 VENTANA MODAL (POPUP) 🔽 */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        
                        {/* Cabecera del Modal */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                Pedido <span className="text-indigo-600">#{selectedOrder.id}</span>
                            </h3>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Contenido: Lista de Productos */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 uppercase font-bold">Cliente</p>
                                <p className="text-gray-900">{selectedOrder.user?.name}</p>
                                <p className="text-gray-500 text-sm">{selectedOrder.user?.email}</p>
                            </div>

                            <table className="w-full text-sm">
                                <thead className="text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="py-2 text-left">Producto</th>
                                        <th className="py-2 text-center">Cant.</th>
                                        <th className="py-2 text-right">Precio Unit.</th>
                                        <th className="py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedOrder.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3 font-medium text-gray-800">
                                                {item.product?.name || "Producto borrado"}
                                            </td>
                                            <td className="py-3 text-center text-gray-600">x{item.quantity}</td>
                                            <td className="py-3 text-right text-gray-600">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price)}
                                            </td>
                                            <td className="py-3 text-right font-bold text-gray-900">
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pie del Modal */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-500 text-sm">
                                Fecha: {new Date(selectedOrder.created_at).toLocaleString()}
                            </span>
                            <div className="text-xl font-bold text-gray-900">
                                Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(selectedOrder.total)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}