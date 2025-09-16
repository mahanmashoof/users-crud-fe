import { useEffect, useState } from "react";
import "./App.css";

interface IUser {
  id: number | null;
  name: string;
  userName: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<IUser>({
    id: null,
    name: "",
    userName: "",
    email: "",
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const backendUrl = import.meta.env.VITE_BE_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(backendUrl);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${backendUrl}/${user.id}` : backendUrl;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error("Failed to save user");

      await fetchUsers(); // Refresh the user list
      setUser({ id: null, name: "", userName: "", email: "" }); // Clear form
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user.");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${backendUrl}/${userId}`, { method: "DELETE" });
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (userToEdit: any) => {
    setUser(userToEdit);
    setIsEditing(true);
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2 className="title">{isEditing ? "Edit User" : "Create New User"}</h2>
        <form onSubmit={handleCreateOrUpdate}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Name"
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="userName"
              value={user.userName}
              onChange={handleChange}
              placeholder="Username"
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Email"
              className="input-field"
              required
            />
          </div>
          {users.length < 5 ? (
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update User" : "Create User"}
            </button>
          ) : (
            <p style={{ color: "red", textAlign: "center", letterSpacing: 1 }}>
              User limit reached. Cannot add more users.
            </p>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setUser({ id: null, name: "", userName: "", email: "" });
                setIsEditing(false);
              }}
              className="btn btn-secondary"
              style={{ width: "100%", marginLeft: 0 }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card user-list-card">
        <h2 className="title">User List</h2>
        <ul className="user-list">
          {users.map((u) => (
            <li key={u.id} className="user-item">
              <div className="user-info">
                <h3>
                  {u.name} ({u.userName})
                </h3>
                <p>{u.email}</p>
              </div>
              <div className="user-actions">
                <button className="btn btn-edit" onClick={() => handleEdit(u)}>
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(u.id!)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
