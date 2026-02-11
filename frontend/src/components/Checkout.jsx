const handleCheckout = () => {
    if (!user) { // Si no hay usuario en el contexto de Auth
        alert("Debes iniciar sesión con Google para comprar");
        window.location.href = "http://localhost/auth/google/redirect";
    } else {
        // Ir a la página de pago
        navigate('/checkout'); 
    }
};