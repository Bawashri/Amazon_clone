import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import BuyNowPage from "./pages/BuyNowPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage, {
  AdminAddProductSection,
  AdminAllOrdersSection,
  AdminAllProductsSection,
  AdminPendingOrdersSection
} from "./pages/AdminDashboardPage";

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
          <Route path="/products/:id" element={<ProductDetailsPage />} />

          <Route element={<ProtectedRoute roles={["USER", "ADMIN"]} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/buy-now/:id" element={<BuyNowPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />}>
              <Route index element={<Navigate to="pending-orders" replace />} />
              <Route path="pending-orders" element={<AdminPendingOrdersSection />} />
              <Route path="add-product" element={<AdminAddProductSection />} />
              <Route path="all-orders" element={<AdminAllOrdersSection />} />
              <Route path="all-products" element={<AdminAllProductsSection />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
