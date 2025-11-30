const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
// This is your specific connection string from the chat
const uri = "mongodb+srv://manvithmarupudi007_db_user:Manvith_12345@cluster0.fvzs3w5.mongodb.net/?appName=Cluster0";

// Global variables to hold the database connection
let db;
let donationsCollection;

// Connect to MongoDB
const client = new MongoClient(uri);

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas (Native Driver)");
    
    // 2. Select Database & Collection
    // MongoDB auto-creates these if they don't exist
    db = client.db("food_security");
    donationsCollection = db.collection("donations");
    
    // 3. Start the Server ONLY after DB connects (Safer)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    
  } catch (err) {
    console.error("❌ Connection Error:", err);
  }
}

// Initialize
startServer();

// --- API ROUTES ---

// 1. GET ALL: Retrieve all donations
app.get('/api/donations', async (req, res) => {
  try {
    if (!donationsCollection) return res.status(503).json({ error: "Database not initialized" });
    
    const donations = await donationsCollection.find({}).sort({ _id: -1 }).toArray();
    const formatted = donations.map(d => ({ ...d, id: d._id }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE: Add a new donation
app.post('/api/donations', async (req, res) => {
  try {
    const newDonation = {
      foodItem: req.body.foodItem,
      quantity: req.body.quantity,
      expiryDate: req.body.expiryDate,
      pickupLocation: req.body.pickupLocation,
      type: req.body.type || 'prepared',
      donorId: req.body.donorId,
      donorName: req.body.donorName,
      status: 'available',
      createdAt: new Date()
    };

    const result = await donationsCollection.insertOne(newDonation);
    res.status(201).json({ ...newDonation, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE: Claim or Distribute
app.patch('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await donationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({ message: "Updated successfully", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE: Remove a donation
app.delete('/api/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await donationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});