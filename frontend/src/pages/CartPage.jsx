import { useEffect, useState } from "react";
import api from "../api/axios";

const CartPage = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/cart");
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (id, quantity) => {
    const nextQty = Math.max(1, Number(quantity) || 1);
    await api.put(`/cart/${id}`, { quantity: nextQty });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/cart/${id}`);
    load();
  };

  return (
    <section className="cart-page">
      <h2>Cart</h2>
      {!items.length ? (
        <article className="card empty-state">Your cart is empty.</article>
      ) : (
        <div className="stack">
          <article className="card list-card">
            <div className="item-main">
              <h3>Subtotal</h3>
              <p className="price">
                Rs. {items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity || 1), 0).toFixed(2)}
              </p>
            </div>
          </article>
          {items.map((i) => (
            <article key={i.id} className="card list-card">
              <div className="item-main">
                <h3>{i.name}</h3>
                <p className="price">Rs. {Number(i.price).toFixed(2)}</p>
                <p className="muted">Total: Rs. {(Number(i.price) * Number(i.quantity || 1)).toFixed(2)}</p>
              </div>
              <div className="item-controls">
                <label>
                  Qty
                  <input
                    className="qty-input"
                    type="number"
                    min="1"
                    value={i.quantity}
                    onChange={(e) => updateQty(i.id, e.target.value)}
                  />
                </label>
                <button onClick={() => remove(i.id)} className="btn-secondary">
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CartPage;
