import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setQuantity(1);
    } catch (err) {
      setError("Product not found.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const requireLogin = (infoMessage) => {
    setMessage(infoMessage);
    navigate("/login", { state: { from: location.pathname } });
  };

  const buyNow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      requireLogin("Please login to buy products");
      window.alert("Please login to buy products");
      return;
    }

    const nextQty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    navigate(`/buy-now/${product.id}?qty=${nextQty}`);
  };

  const addToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      requireLogin("Please login to add to cart");
      window.alert("Please login to add to cart");
      return;
    }

    const nextQty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    await api.post("/cart", { product_id: product.id, quantity: nextQty });
    setMessage("Added to cart");
    window.alert("Added to cart");
  };

  const addToWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      requireLogin("Please login to add to wishlist");
      window.alert("Please login to add to wishlist");
      return;
    }

    await api.post("/wishlist", { product_id: product.id });
    setMessage("Added to wishlist");
    window.alert("Added to wishlist");
  };

  const totalLabel = useMemo(() => {
    if (!product) return "";
    const nextQty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    return (Number(product.price) * nextQty).toFixed(2);
  }, [product, quantity]);

  if (loading) {
    return <section className="card">Loading product...</section>;
  }

  if (error || !product) {
    return (
      <section className="card">
        <p className="error">{error || "Product not found."}</p>
        <Link to="/products">Back to Products</Link>
      </section>
    );
  }

  return (
    <section className="product-details-page">
      <Link to="/products" className="product-back-link">
        Back to Products
      </Link>
      {message && <p className="info">{message}</p>}

      <article className="card product-details-card">
        <div className="product-details-image-wrap">
          <img src={product.image_url} alt={product.name} />
        </div>
        <div className="product-details-content">
          <h2>{product.name}</h2>
          <p className="muted">Category: {product.category_name}</p>
          <p>{product.description}</p>
          <p className="price">Rs. {Number(product.price).toFixed(2)}</p>
          <p className="muted">Stock: {product.stock}</p>
          <p className="muted">Total: Rs. {totalLabel}</p>

          <div className="actions product-details-actions">
            <input
              className="qty-input"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
            />
            <button onClick={addToCart}>Add Cart</button>
            <button onClick={addToWishlist} className="btn-secondary">
              Wishlist
            </button>
            <button onClick={buyNow} className="btn-buy">
              Buy Now
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ProductDetailsPage;
