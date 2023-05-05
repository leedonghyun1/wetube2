import mongoose from "mongoose";
import bcrypt from  "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  githubLoginOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: false},
  location: String,
  comment : [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

//mongoose middleware + middlware 는 Model 생성 전에 만들어져야 한다.
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model('User', userSchema);
export default User;