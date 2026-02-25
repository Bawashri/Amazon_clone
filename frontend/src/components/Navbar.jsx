import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/products" className="brand">
        amazon
      </Link>
      <nav>
        <Link to="/products">Products</Link>
        {isAuthenticated && <Link to="/cart">Cart</Link>}
        {isAuthenticated && <Link to="/wishlist">Wishlist</Link>}
        {isAuthenticated && <Link to="/orders">Orders</Link>}
        {isAuthenticated && <Link to="/profile">Profile</Link>}
        {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/signup">Signup</Link>}
        {isAuthenticated && (
          <button onClick={handleLogout} className="btn-secondary" type="button">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
