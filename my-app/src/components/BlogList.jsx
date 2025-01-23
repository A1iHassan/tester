import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const BlogList = ({ blogs, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
      {blogs.map((blog) => (
        <div key={uuidv4()} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
          <p className="text-gray-600 mb-4">{blog.content}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(blog)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(blog.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
