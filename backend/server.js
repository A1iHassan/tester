// Required dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const FORMS_FILE = path.join(DATA_DIR, 'forms.json');

// Ensure data directory and files exist
async function initializeDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize files if they don't exist
        const files = [USERS_FILE, POSTS_FILE, FORMS_FILE];
        for (const file of files) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, JSON.stringify([]));
            }
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// File operations helper functions
async function readJsonFile(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Auth Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, gender, password } = req.body;
        const users = await readJsonFile(USERS_FILE);

        if (users.find(u => u.email === email)) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            gender,
            password: hashedPassword
        };

        users.push(newUser);
        await writeJsonFile(USERS_FILE, users);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readJsonFile(USERS_FILE);
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Posts Routes
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const post = posts.find(p => p.id === req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const posts = await readJsonFile(POSTS_FILE);
        
        const newPost = {
            id: Date.now().toString(),
            title,
            content,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        posts.push(newPost);
        await writeJsonFile(POSTS_FILE, posts);
        
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const posts = await readJsonFile(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (posts[postIndex].userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        posts[postIndex] = {
            ...posts[postIndex],
            title,
            content
        };
        
        await writeJsonFile(POSTS_FILE, posts);
        res.json(posts[postIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (posts[postIndex].userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        posts.splice(postIndex, 1);
        await writeJsonFile(POSTS_FILE, posts);
        
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Forms Routes
app.post('/api/posts/:postId/forms', authenticateToken, async (req, res) => {
    try {
        const { formData } = req.body;
        const forms = await readJsonFile(FORMS_FILE);
        const posts = await readJsonFile(POSTS_FILE);
        
        if (!posts.find(p => p.id === req.params.postId)) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const newForm = {
            id: Date.now().toString(),
            postId: req.params.postId,
            userId: req.user.id,
            formData,
            createdAt: new Date().toISOString()
        };
        
        forms.push(newForm);
        await writeJsonFile(FORMS_FILE, forms);
        
        res.status(201).json(newForm);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/posts/:postId/forms', async (req, res) => {
    try {
        const forms = await readJsonFile(FORMS_FILE);
        const postForms = forms.filter(f => f.postId === req.params.postId);
        res.json(postForms);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize data files and start server
(async () => {
    await initializeDataFiles();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();