import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProductsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", categoryId: "", minPrice: "", maxPrice: "" });
  const [message, setMessage] = useState("");
  const [quantities, setQuantities] = useState({});

  const loadProducts = async () => {
    const min = Number(filters.minPrice);
    const max = Number(filters.maxPrice);
    const params = {
      search: filters.search,
      categoryId: filters.categoryId
    };
    if (!Number.isNaN(min) && filters.minPrice !== "") params.minPrice = min;
    if (!Number.isNaN(max) && filters.maxPrice !== "") params.maxPrice = max;

    const { data } = await api.get("/products", { params });
    let next = data;

    if (!Number.isNaN(min) && filters.minPrice !== "") {
      next = next.filter((p) => Number(p.price) >= min);
    }
    if (!Number.isNaN(max) && filters.maxPrice !== "") {
      next = next.filter((p) => Number(p.price) <= max);
    }

    setProducts(next);
  };

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.search, filters.categoryId, filters.minPrice, filters.maxPrice]);

  const requireLogin = (infoMessage) => {
    setMessage(infoMessage);
    navigate("/login", { state: { from: "/products" } });
  };

  const buyNow = async (product_id) => {
    if (!isAuthenticated) {
      requireLogin("Please login to buy products");
      window.alert("Please login to buy products");
      return;
    }
    const quantity = Math.max(1, Number(quantities[product_id] ?? 1) || 1);
    navigate(`/buy-now/${product_id}?qty=${quantity}`);
  };

  const addToCart = async (product_id) => {
    if (!isAuthenticated) {
      requireLogin("Please login to add to cart");
      window.alert("Please login to add to cart ");
      return;
    }
    await api.post("/cart", { product_id, quantity: 1 });
    setMessage("Added to cart");
    window.alert("Added to cart");
  };

  const addToWishlist = async (product_id) => {
    if (!isAuthenticated) {
      requireLogin("Please login to add to wishlist");
      window.alert("Please login to add to wishlist ");
      return;
    }
    await api.post("/wishlist", { product_id });
    setMessage("Added to wishlist");
    window.alert("Added to wishlist");
  };

  const countLabel = useMemo(() => `${products.length} products found`, [products]);

  return (
    <section>
      <h2>Products</h2>
      <div className="card filters">
        <input
          placeholder="Search by name"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Min Price"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          placeholder="Max Price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
      </div>

      {message && <p className="info">{message}</p>}
      {isAuthenticated && user?.subscription && <p className="info">Subscription: {user.subscription}</p>}
      <p className="muted">{countLabel}</p>

      <div className="grid">
        {products.map((p) => (
          <article key={p.id} className="card product-card">
            <Link to={`/products/${p.id}`} className="product-link">
              <img src={p.image_url} alt={p.name} />
            </Link>
            <h3>
              <Link to={`/products/${p.id}`} className="product-link">
                {p.name}
              </Link>
            </h3>
            <p className="product-desc">{p.description}</p>
            <p>
              <strong>Price: Rs. {Number(p.price).toFixed(2)}</strong>
            </p>
            <p className="muted">
              Total: Rs. {(Number(p.price) * (Number(quantities[p.id]) || 1)).toFixed(2)}
            </p>
            <p className="muted">Stock: {p.stock}</p>
            <div className="actions">
              <input
                className="qty-input"
                type="number"
                min="1"
                max={p.stock}
                value={quantities[p.id] || 1}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [p.id]: Math.max(1, Math.min(Number(e.target.value) || 1, p.stock))
                  }))
                }
              />
              <button onClick={() => addToCart(p.id)}>Add Cart</button>
              <button onClick={() => addToWishlist(p.id)} className="btn-secondary">
                Wishlist
              </button>
              <button onClick={() => buyNow(p.id)} className="btn-buy">
                Buy Now
              </button>
            </div>
            <Link to={`/products/${p.id}`} className="product-details-link">
              View Product Details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;
