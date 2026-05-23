const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

const LicenseSchema = new mongoose.Schema({
    license: String,
    hwid: String,
    banned: Boolean
});

const License = mongoose.model("License", LicenseSchema);

app.post("/validate", async (req, res) => {
    try {
        const { license, hwid } = req.body;

        const key = await License.findOne({ license });

        if (!key)
            return res.json({ success: false });

        if (key.banned)
            return res.json({ success: false });

        if (key.hwid === "") {
            key.hwid = hwid;
            await key.save();
        }

        if (key.hwid !== hwid)
            return res.json({ success: false });

        return res.json({ success: true });

    } catch {
        return res.json({ success: false });
    }
});

app.post("/create-license", async (req, res) => {

    const { license } = req.body;

    const existing = await License.findOne({ license });

    if (existing)
    {
        return res.json({
            success: false,
            message: "License already exists"
        });
    }

    const newLicense = new License({
        license: license,
        hwid: "",
        banned: false
    });

    await newLicense.save();

    return res.json({
        success: true,
        message: "License created"
    });

});

app.get("/", (req, res) => {
    res.send("V3X PANEL ONLINE");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
