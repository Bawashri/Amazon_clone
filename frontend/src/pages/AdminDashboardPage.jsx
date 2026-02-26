import { useEffect, useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import api from "../api/axios";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  stock: "",
  image_url: ""
};

const useAdminContext = () => useOutletContext();

export const AdminPendingOrdersSection = () => {
  const { pendingOrders, approve, reject } = useAdminContext();

  return (
    <div className="card admin-pending">
      <h3>Pending Orders</h3>
      {!pendingOrders.length && <p className="muted">No pending orders.</p>}
      {pendingOrders.map((o) => (
        <div className="row admin-pending-row" key={o.id}>
          <span>
            #{o.id} {o.user_name} - {o.product_name} x{o.quantity}
          </span>
          <div className="actions-inline">
            <button onClick={() => approve(o.id)}>Approve</button>
            <button className="btn-secondary" onClick={() => reject(o.id)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminAddProductSection = () => {
  const { categories, form, setForm, editingId, submitProduct, cancelEdit } = useAdminContext();

  return (
    <div className="card form-card">
      <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
      <form onSubmit={submitProduct}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />
        <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <div className="actions-inline">
          <button type="submit">{editingId ? "Save Changes" : "Create Product"}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export const AdminAllOrdersSection = () => {
  const { orders, ordersError, updateOrderStatus } = useAdminContext();

  return (
    <div className="card admin-orders">
      <h3>All Orders</h3>
      {ordersError && <p className="error">{ordersError}</p>}
      {!orders.length && <p className="muted">No orders yet.</p>}
      {orders.map((o) => (
        <div className="row admin-order-row" key={o.id}>
          <span>
            #{o.id} {o.user_name} - {o.product_name} x{o.quantity} ({o.status})
          </span>
          <div className="actions-inline">
            <button onClick={() => updateOrderStatus(o.id, "SHIPPED")} disabled={o.status !== "APPROVED"}>
              Mark Shipped
            </button>
            <button className="btn-secondary" onClick={() => updateOrderStatus(o.id, "DELIVERED")} disabled={o.status !== "SHIPPED"}>
              Mark Delivered
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminAllProductsSection = () => {
  const { products, startEdit, deleteProduct } = useAdminContext();

  return (
    <div className="card admin-products">
      <h3>All Products</h3>
      {!products.length && <p className="muted">No products found.</p>}
      {products.map((p) => (
        <div className="row admin-product-row" key={p.id}>
          <span>
            {p.name} - Rs. {Number(p.price).toFixed(2)}
          </span>
          <div className="actions-inline">
            <button onClick={() => startEdit(p)}>Edit</button>
            <button className="btn-secondary" onClick={() => deleteProduct(p.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboardPage = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const [pendingRes, productsRes, categoriesRes] = await Promise.allSettled([
      api.get("/admin/orders/pending"),
      api.get("/products"),
      api.get("/categories")
    ]);

    if (pendingRes.status === "fulfilled") setPendingOrders(pendingRes.value.data);
    if (productsRes.status === "fulfilled") setProducts(productsRes.value.data);
    if (categoriesRes.status === "fulfilled") setCategories(categoriesRes.value.data);

    try {
      setOrdersError("");
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (error) {
      try {
        const res = await api.get("/orders", { params: { all: true } });
        setOrders(res.data);
      } catch (innerError) {
        setOrders([]);
        setOrdersError("Unable to load orders. Check admin API or restart backend.");
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (orderId) => {
    await api.post(`/admin/orders/${orderId}/approve`);
    load();
  };

  const reject = async (orderId) => {
    const reason = prompt("Reject reason") || "Not specified";
    await api.post(`/admin/orders/${orderId}/reject`, { reason });
    load();
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      category_id: Number(form.category_id),
      stock: Number(form.stock)
    };

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post("/products", payload);
    }

    setForm(emptyProduct);
    setEditingId(null);
    load();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category_id: product.category_id ?? "",
      stock: product.stock ?? "",
      image_url: product.image_url || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyProduct);
  };

  const updateOrderStatus = async (orderId, status) => {
    await api.patch(`/admin/orders/${orderId}/status`, { status });
    load();
  };

  return (
    <section className="admin-page">
      <h2>Admin Dashboard</h2>
      <div className="admin-layout">
        <aside className="card admin-sidebar">
          <nav>
            <NavLink to="pending-orders" className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              Pending Orders
            </NavLink>
            <NavLink to="add-product" className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              Add Product
            </NavLink>
            <NavLink to="all-orders" className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              All Orders
            </NavLink>
            <NavLink to="all-products" className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              All Products
            </NavLink>
          </nav>
        </aside>

        <div className="admin-content">
          <Outlet
            context={{
              pendingOrders,
              approve,
              reject,
              categories,
              form,
              setForm,
              editingId,
              submitProduct,
              cancelEdit,
              orders,
              ordersError,
              updateOrderStatus,
              products,
              startEdit,
              deleteProduct
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
