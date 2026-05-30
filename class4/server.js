const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve public directory statically
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed! (jpeg, jpg, png, gif, webp)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Successfully connected to MongoDB Atlas!'))
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.log('Please verify your connection string and network permissions.');
  });

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  userId: { type: String, required: true, unique: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  mailId: { type: String, required: true, trim: true },
  imagePath: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// API Endpoints

// Create a new user with image upload
app.post('/api/users', upload.single('image'), async (req, res) => {
  try {
    const { username, userId, mobileNumber, mailId } = req.body;
    
    // Check if image file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image!' });
    }

    // Check if userId already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      // Clean up uploaded file if registration fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `User ID "${userId}" is already registered!` });
    }

    // Save relative image URL (e.g. /uploads/filename.jpg)
    const imagePath = `/uploads/${req.file.filename}`;

    const newUser = new User({
      username,
      userId,
      mobileNumber,
      mailId,
      imagePath
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    // Clean up uploaded file on server error if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Catch Mongoose validation or duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User ID already exists!' });
    }
    
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Update a user (with optional image re-upload)
app.put('/api/users/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, userId, mobileNumber, mailId } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found.' });
    }

    // If userId changed, check uniqueness
    if (userId !== existingUser.userId) {
      const duplicate = await User.findOne({ userId });
      if (duplicate) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: `User ID "${userId}" is already taken!` });
      }
    }

    // Build update object
    const updateData = { username, userId, mobileNumber, mailId };

    // If a new image was uploaded, replace the old one
    if (req.file) {
      // Delete old image file
      const oldImagePath = path.join(__dirname, 'public', existingUser.imagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.imagePath = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Update error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete uploaded image from disk
    const imagePath = path.join(__dirname, 'public', user.imagePath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});


// Error handling for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`📡 Server running on http://localhost:${PORT}`);
});
