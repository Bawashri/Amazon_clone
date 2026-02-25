import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    subscription: "NORMAL"
  });
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <section className="card form-card">
      <h2>Signup</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <select value={form.subscription} onChange={(e) => setForm({ ...form, subscription: e.target.value })}>
          <option value="NORMAL">NORMAL</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create Account</button>
      </form>
    </section>
  );
};

export default SignupPage;
