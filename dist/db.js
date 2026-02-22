// create user models and schemas 
import mongoose, { model, Schema } from "mongoose";
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/brainly";
console.log("Attempting to connect to MongoDB...");
if (!process.env.MONGODB_URI) {
    console.warn("Warning: MONGODB_URI environment variable is not set. Falling back to localhost.");
}
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 30+
})
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => {
    console.error("Critical: Could not connect to MongoDB!", err);
    process.exit(1); // Exit if DB connection fails in production
});
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String
});
export const UserModel = model("User", UserSchema);
const ContentSchema = new Schema({
    title: String,
    link: String,
    type: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
});
const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
});
export const LinkModel = model("Links", LinkSchema);
export const ContentModel = mongoose.model("Content", ContentSchema);
//# sourceMappingURL=db.js.map