// Required dependencies
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const Redis = require("ioredis");
require("dotenv").config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Redis client setup
const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
  // password: process.env.REDIS_PASSWORD, // Uncomment if you have password
});

// Handle Redis connection errors
redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Middleware
app.use(cors());
app.use(express.json());

// Redis helper functions
async function saveToRedis(key, data) {
  await redis.set(key, JSON.stringify(data));
}

async function getFromRedis(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function getList(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : [];
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Auth Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;
    const users = await getList("users");

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      gender,
      password: hashedPassword,
    };

    users.push(newUser);
    await saveToRedis("users", users);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await getList("users");
    const user = users.find((u) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, gender, address, dateOfBirth, interests } = req.body;
    const users = await getList("users");

    const userIndex = users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile with new/additional fields
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      phone: phone || users[userIndex].phone,
      gender: gender || users[userIndex].gender,
      address: address || users[userIndex].address,
      dateOfBirth: dateOfBirth || users[userIndex].dateOfBirth,
      interests: interests || users[userIndex].interests,
    };

    // Save updated user list
    await saveToRedis("users", users);

    // Return updated user profile (excluding sensitive info like password)
    const { password, ...updatedUserProfile } = users[userIndex];

    res.json(updatedUserProfile);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Posts Routes
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await getList("posts");
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const posts = await getList("posts");
    const post = posts.find((p) => p.id === req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      availability,
      location,
      maximumRequests,
    } = req.body;

    const posts = await getList("posts");
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      category,
      availability: availability ? new Date(availability).toISOString() : null,
      location,
      maximumRequests: maximumRequests || null,
    };

    posts.push(newPost);
    await saveToRedis("posts", posts);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      availability,
      location,
      maximumRequests,
    } = req.body;

    const posts = await getList("posts");
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      category,
      availability: availability ? new Date(availability).toISOString() : null,
      location,
      maximumRequests: maximumRequests || null,
    };

    posts.push(newPost);
    await saveToRedis("posts", posts);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      availability,
      location,
      maximumRequests,
    } = req.body;
    const posts = await getList("posts");
    const postIndex = posts.findIndex((p) => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (posts[postIndex].userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    posts[postIndex] = {
      ...posts[postIndex],
      title: title || posts[postIndex].title,
      content: content || posts[postIndex].content,
      category: category || posts[postIndex].category,
      availability: availability
        ? new Date(availability).toISOString()
        : posts[postIndex].availability,
      location: location || posts[postIndex].location,
      maximumRequests: maximumRequests || posts[postIndex].maximumRequests,
    };

    await saveToRedis("posts", posts);
    res.json(posts[postIndex]);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const posts = await getList("posts");
    const postIndex = posts.findIndex((p) => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (posts[postIndex].userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    posts.splice(postIndex, 1);
    await saveToRedis("posts", posts);

    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forms Routes
app.post("/api/posts/:postId/forms", authenticateToken, async (req, res) => {
  try {
    const { formData } = req.body;
    const forms = await getList("forms");
    const posts = await getList("posts");

    if (!posts.find((p) => p.id === req.params.postId)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newForm = {
      id: Date.now().toString(),
      postId: req.params.postId,
      userId: req.user.id,
      formData,
      createdAt: new Date().toISOString(),
    };

    forms.push(newForm);
    await saveToRedis("forms", forms);

    res.status(201).json(newForm);
  } catch (error) {
    console.error("Submit form error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/posts/:postId/forms", async (req, res) => {
  try {
    const forms = await getList("forms");
    const postForms = forms.filter((f) => f.postId === req.params.postId);
    res.json(postForms);
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
