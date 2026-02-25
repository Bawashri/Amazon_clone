import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/products" element={<ProductsPage />} />

          <Route element={<ProtectedRoute roles={["USER", "ADMIN"]} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
