import { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import BlogList from "./components/BlogList";
import BlogForm from "./components/BlogForm";
import axios from "axios";

const BASE_URL = "http://157.245.135.17:7777/api/v1";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to inject token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

const App = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  const fetchUserData = async (token) => {
    try {
      const response = await api.get("/users");
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token");
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await api.get("/blogs/0"); // Using 0 to get all blogs
      setBlogs(response.data.blogs);
      console.log(response.data.blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleAuth = async (formData) => {
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const response = await api.post(endpoint, formData);

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.access_token);
        // After login/register, fetch user data
        await fetchUserData(response.data.access_token);
      }
    } catch (error) {
      console.error("Auth error:", error);
      throw error; // Propagate error to form component
    }
  };

  const handleCreateBlog = async (formData) => {
    try {
      const response = await api.post("/blogs", {
        title: formData.title,
        content: formData.content,
      });

      if (response.data.status === "success") {
        setBlogs([...blogs, response.data.blog]);
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  };

  const handleUpdateBlog = async (formData) => {
    try {
      const response = await api.put("/blogs", {
        blog_id: editingBlog.blog_id,
        new_title: formData.title,
        new_content: formData.content,
      });

      if (response.data.status === "success") {
        setBlogs(
          blogs.map((blog) =>
            blog.blog_id === editingBlog.blog_id ? response.data.blog : blog
          )
        );
        setEditingBlog(null);
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      throw error;
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const response = await api.delete("/blogs", {
        data: { blog_id: blogId },
      });

      if (response.data.message === "blog have been deleted") {
        setBlogs(blogs.filter((blog) => blog.blog_id !== blogId));
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-600"
          >
            Switch to {isLogin ? "Register" : "Login"}
          </button>
        </div>
        <AuthForm isLogin={isLogin} onSubmit={handleAuth} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setUser(null);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <BlogForm
        blog={editingBlog}
        onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog}
      />
      <div className="mt-8">
        <BlogList
          blogs={blogs}
          onEdit={setEditingBlog}
          onDelete={handleDeleteBlog}
        />
      </div>
    </div>
  );
};

export default App;
