const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ১. আপনার MongoDB কানেকশন (পাসওয়ার্ড এনকোড করা আছে)
const mongoURI = "mongodb+srv://nexthiddenelite:xnazim%40%23%23123.@nexthiddenelite.igyxjs9.mongodb.net/NHE_DATABASE?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// ✅ ২. ডাটা মডেল (UID কে unique রাখা হয়েছে ডুপ্লিকেট আটকানোর জন্য)
const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const BOT_TOKEN = "8475138855:AAFQMWnAHUJqGsx06QZFw60lXugY15ynkig"; //
const CHAT_ID = "8135816344"; //

// ✅ ৩. মেইন সেন্ড রুট (ডুপ্লিকেট চেকসহ)
app.post("/send", async (req, res) => {
    let uid = req.body.uid;
    if (!uid) return res.json({ status: "no uid" });

    try {
        // ডুপ্লিকেট চেক করবে ডাটাবেসে
        const existingUser = await User.findOne({ uid });
        if (existingUser) {
            console.log("Duplicate UID detected:", uid);
            return res.json({ status: "already_added" });
        }

        // ডাটাবেসে সেভ করবে
        const newUser = new User({ uid });
        await newUser.save();

        // টেলিগ্রামে পাঠাবে
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: {
                chat_id: CHAT_ID,
                text: `🔥 NEW TRIAL REQUEST\nUID: ${uid}`
            }
        });

        res.json({ status: "sent" });
    } catch (err) {
        console.log("Error:", err.message);
        res.json({ status: "error" });
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server is active!");
});
