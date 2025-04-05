const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { connectDB } = require('./db');

const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const taskRouter = require("./routes/task");
const commentRouter = require("./routes/comment");
const summarizerRouter = require("./routes/summarizer");
const translatorRouter = require("./routes/translator");
const mailRouter = require("./routes/mail/mailRoutes");

const app = express();
const PORT = 3001; // Move this above app.listen()

// Middleware for parsing request bodies
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for large transcripts
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/task", taskRouter);
app.use("/comment", commentRouter);
app.use("/api", summarizerRouter);
app.use("/api", translatorRouter);
app.use("/mail", mailRouter);

// Start server only after connecting to MongoDB
const startBackend = async () => {
    try {
        await connectDB(); // Wait for database connection and try again and again

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start backend:', error);
        process.exit(1);
    }
};

startBackend(); // Call this to start the server
