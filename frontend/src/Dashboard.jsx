import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
    // 1. Estados para guardar los datos
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. Pedimos la lista de pedidos al Backend
        axios.get("/api/orders")
            .then(response => {
                const data = response.data;
                setOrders(data);

                // 3. Calculamos estadísticas matemáticas (Suma total)
                const revenue = data.reduce((acc, order) => acc + parseFloat(order.total), 0);
                
                setStats({
                    totalOrders: data.length,
                    totalRevenue: revenue
                });
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
        <div className="min-h-screen bg-gray-100 p-8">
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                    <p className="text-gray-500">Resumen de ventas y actividad reciente</p>
                </div>
                <div className="space-x-4">
                    <Link to="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
                        ← Volver a la Tienda
                    </Link>
                </div>
            </div>

            {/* TARJETAS DE ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Tarjeta 1: Ingresos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4 text-2xl">
                        💰
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Ingresos Totales</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                        </p>
                    </div>
                </div>

                {/* Tarjeta 2: Pedidos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4 text-2xl">
                        📦
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Ventas Realizadas</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* TABLA DE PEDIDOS */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Historial de Pedidos</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 font-semibold">Referencia</th>
                                <th className="p-4 font-semibold">Cliente</th>
                                <th className="p-4 font-semibold">Fecha</th>
                                <th className="p-4 font-semibold">Estado</th>
                                <th className="p-4 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-mono text-indigo-600 font-bold">#{order.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{order.user?.name || "Usuario Eliminado"}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString()} 
                                        <span className="text-gray-400 ml-1 text-xs">
                                            {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700'}
                                        `}>
                                            {order.status === 'paid' ? 'Pagado' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-900 text-base">
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
                                    </td>
                                </tr>
                            ))}
                            
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">
                                        <p className="text-xl mb-2">📭</p>
                                        Todavía no hay ventas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}