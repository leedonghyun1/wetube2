import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
  hashtags: [{ type: String }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comment: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static('formatHashtags', function (hashtags) {
  return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
});
//middleware랑 static은 model 생성전에 만들어져야 한다.

const Video = mongoose.model("Video", videoSchema);

export default Video;
