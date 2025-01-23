import { useState } from "react";

const AuthForm = ({ isLogin, onSubmit }) => {
  const [formData, setFormData] = useState(
    isLogin
      ? { email: "", password: "" }
      : {
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          birthday: "",
        }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={handleChange("first_name")}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={handleChange("last_name")}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birthday</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={handleChange("birthday")}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
