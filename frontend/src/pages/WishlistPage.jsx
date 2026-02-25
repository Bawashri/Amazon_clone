import { useEffect, useState } from "react";
import api from "../api/axios";

const WishlistPage = () => {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/wishlist");
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await api.delete(`/wishlist/${id}`);
    load();
  };

  return (
    <section className="wishlist-page">
      <h2>Wishlist</h2>
      {!items.length ? (
        <article className="card empty-state">Your wishlist is empty.</article>
      ) : (
        <div className="stack">
          {items.map((i) => (
            <article key={i.id} className="card list-card">
              <div className="item-main">
                <h3>{i.name}</h3>
                <p className="price">Rs. {Number(i.price).toFixed(2)}</p>
              </div>
              <div className="item-controls">
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

export default WishlistPage;
