import { useState, useEffect } from "react";

const BlogForm = ({ blog, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (blog) {
      setFormData({ title: blog.title, content: blog.content });
    }
  }, [blog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", content: "" });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {blog ? "Edit Blog" : "Create New Blog"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {blog ? "Update Blog" : "Create Blog"}
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
