import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get("/api/my-orders");
                setOrders(data);
            } catch (error) {
                console.error("Error cargando pedidos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                <span className="text-4xl">📦</span> Mis Pedidos
            </h1>

            {orders.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mb-6">Aún no has realizado ninguna compra.</p>
                    <a href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        Ir a la tienda
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center sm:flex-row flex-col gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido #{order.id}</p>
                                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {order.status === 'paid' ? 'Pagado' : order.status}
                                    </span>
                                    <p className="text-xl font-black text-gray-900">{order.total}€</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {order.items.map((item) => (
                                        <li key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                                                {item.product?.image ? (
                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-bold text-gray-900">{item.product?.name || "Producto no disponible"}</h3>
                                                <p className="text-xs text-gray-500">Cantidad: {item.quantity} x {item.price}€</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
