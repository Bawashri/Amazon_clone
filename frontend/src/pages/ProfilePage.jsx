import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, refreshProfile, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", location: "", subscription: "NORMAL" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        location: user.location || "",
        subscription: user.subscription || "NORMAL"
      });
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/profile", form);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    setMessage("Profile updated");
  };

  return (
    <section className="card form-card profile-card">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button onClick={() => refreshProfile()} className="btn-secondary" type="button">
          Refresh Profile
        </button>
      </div>
      <form className="profile-form" onSubmit={submit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Location"
        />
        <select value={form.subscription} onChange={(e) => setForm({ ...form, subscription: e.target.value })}>
          <option value="NORMAL">NORMAL</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className="info">{message}</p>}
      {user && (
        <div className="card muted-block profile-info">
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Subscription: {user.subscription}</p>
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
