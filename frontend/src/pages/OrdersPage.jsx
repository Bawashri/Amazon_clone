import { useEffect, useState } from "react";
import api from "../api/axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const load = async () => {
    const [ordersRes, rejectedRes] = await Promise.all([api.get("/orders/my"), api.get("/orders/rejected")]);
    setOrders(ordersRes.data);
    setRejected(rejectedRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateFeedbackForm = (orderId, updates) => {
    setFeedbackForms((prev) => ({
      ...prev,
      [orderId]: { rating: "", comment: "", ...prev[orderId], ...updates }
    }));
  };

  const submitFeedback = async (order) => {
    const form = feedbackForms[order.id] || {};
    if (!form.rating) {
      setFeedbackMessage("Please select a rating.");
      return;
    }
    await api.post("/feedback", {
      product_id: order.product_id,
      rating: Number(form.rating),
      comment: form.comment || ""
    });
    setFeedbackMessage("Feedback submitted.");
    updateFeedbackForm(order.id, { rating: "", comment: "" });
  };

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const activeOrders = orders.filter((o) => !["DELIVERED", "REJECTED"].includes(o.status));

  return (
    <section>
      <h2>My Orders</h2>
      <div className="stack">
        {activeOrders.map((o) => (
          <article key={o.id} className="card row">
            <div>
              <h3>
                #{o.id} - {o.product_name}
              </h3>
              <p>
                Status: <strong>{o.status}</strong>
              </p>
              <p>Price: Rs. {Number(o.price).toFixed(2)}</p>
              <p>Qty: {Number(o.quantity || 1)}</p>
              <p>Total: Rs. {(Number(o.price) * Number(o.quantity || 1)).toFixed(2)}</p>
              {o.status === "DELIVERED" ? (
                <div>
                  <p>Give Feedback</p>
                  <div className="row">
                    <select
                      value={feedbackForms[o.id]?.rating || ""}
                      onChange={(e) => updateFeedbackForm(o.id, { rating: e.target.value })}
                    >
                      <option value="">Rating</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <input
                      placeholder="Comment (optional)"
                      value={feedbackForms[o.id]?.comment || ""}
                      onChange={(e) => updateFeedbackForm(o.id, { comment: e.target.value })}
                    />
                    <button type="button" onClick={() => submitFeedback(o)}>
                      Submit
                    </button>
                  </div>
                  {feedbackMessage && <p className="info">{feedbackMessage}</p>}
                </div>
              ) : (
                <p>Expected Delivery: {o.expected_delivery?.slice(0, 10)}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <h2>Rejected Orders</h2>
      <div className="stack">
        {rejected.map((r) => (
          <article key={r.id} className="card">
            <p>Order #{r.order_id} - {r.product_name}</p>
            <p>Qty: {r.quantity}</p>
            <p>Total: Rs. {(Number(r.price) * Number(r.quantity || 1)).toFixed(2)}</p>
            <p>Reason: {r.reason}</p>
          </article>
        ))}
      </div>

      <h2>Delivered Orders</h2>
      {!deliveredOrders.length ? (
        <article className="card empty-state">No delivered orders yet.</article>
      ) : (
        <div className="stack">
          {deliveredOrders.map((o) => (
            <article key={o.id} className="card row">
              <div>
                <h3>
                  #{o.id} - {o.product_name}
                </h3>
                <p>
                  Status: <strong>{o.status}</strong>
                </p>
                <p>Price: Rs. {Number(o.price).toFixed(2)}</p>
                <p>Qty: {Number(o.quantity || 1)}</p>
                <p>Total: Rs. {(Number(o.price) * Number(o.quantity || 1)).toFixed(2)}</p>
                <div>
                  <p>Give Feedback</p>
                  <div className="row">
                    <select
                      value={feedbackForms[o.id]?.rating || ""}
                      onChange={(e) => updateFeedbackForm(o.id, { rating: e.target.value })}
                    >
                      <option value="">Rating</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <input
                      placeholder="Comment (optional)"
                      value={feedbackForms[o.id]?.comment || ""}
                      onChange={(e) => updateFeedbackForm(o.id, { comment: e.target.value })}
                    />
                    <button type="button" onClick={() => submitFeedback(o)}>
                      Submit
                    </button>
                  </div>
                  {feedbackMessage && <p className="info">{feedbackMessage}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
