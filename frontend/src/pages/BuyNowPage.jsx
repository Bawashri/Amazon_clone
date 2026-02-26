import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const BuyNowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    receiver_name: "",
    phone_number: "",
    address: ""
  });

  const quantity = Math.max(1, Number(searchParams.get("qty") || 1) || 1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const totalAmount = useMemo(() => {
    if (!product) return "0.00";
    return (Number(product.price) * quantity).toFixed(2);
  }, [product, quantity]);

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!product) return;

    try {
      const payload = {
        product_id: product.id,
        quantity,
        receiver_name: form.receiver_name.trim(),
        phone_number: form.phone_number.trim(),
        address: form.address.trim(),
        total_amount: Number(totalAmount)
      };

      const { data } = await api.post("/orders/buy", payload);
      setMessage(data.message || "Order placed");
      window.alert(data.message || "Order placed");
      navigate("/orders");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to place order");
    }
  };

  if (loading) {
    return <section className="card">Loading checkout...</section>;
  }

  if (error || !product) {
    return (
      <section className="card">
        <p className="error">{error || "Product not found."}</p>
        <Link to="/products">Back to Home</Link>
      </section>
    );
  }

  return (
    <section className="buy-now-page">
      <article className="card form-card buy-now-card">
        <h2>Checkout</h2>
        <p className="muted">
          Product: {product.name} x {quantity}
        </p>
        {message && <p className="info">{message}</p>}
        <form onSubmit={placeOrder}>
          <input
            placeholder="Reciver name"
            value={form.receiver_name}
            onChange={(e) => setForm({ ...form, receiver_name: e.target.value })}
            required
          />
          <input
            placeholder="Phone number"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            required
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <input value={`Total Amount: Rs. ${totalAmount}`} readOnly />
          <div className="actions-inline buy-now-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/products")}>
              Back to Home
            </button>
            <button type="submit">Place Order</button>
          </div>
        </form>
      </article>
    </section>
  );
};

export default BuyNowPage;
