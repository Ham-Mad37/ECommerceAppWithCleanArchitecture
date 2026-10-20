import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/common/ToastContainer";

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppRoutes />
          <ToastContainer />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
