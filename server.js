const express = require('express');
const mongodb = require('./data/database');
const bodyParser = require('body-parser');
const route = require('./routes/index.js');
const bcrypt = require('bcryptjs');



const app = express();

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});



app.use('/', route)

mongodb.initDb(async(err) => {
    if (err) {
        console.log(err);
    } else {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        function getCollection() {
            return mongodb.getDatabase().db().collection("users");
        }

        try {
            const existingAdmin = await getCollection().findOne({ email: adminEmail });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                await getCollection().insertOne({
                    name: "Admin",
                    email: adminEmail,
                    password: hashedPassword,
                    role: "admin",
                    isPaid: true,
                });
                console.log("✅ Admin user created");
            } else {
                console.log("ℹ️ Admin already exists");
            }
        } catch (error) {
            console.error("❌ Error creating admin:", error);
        }
        app.listen(port);
        console.log(`Connected to DB and listening on ${port}`);
    }
});