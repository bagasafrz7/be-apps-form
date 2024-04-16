import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema(
 {
  userId: {
   type: mongoose.Schema.Types.ObjectId,
   required: true,
  },
  title: {
   type: String,
  },
  description: {
   type: String,
  },
  questions: {
   type: Array,
  },
  invites: {
   type: Array,
  },
  public: {
   type: Boolean, // true = public, false = private
  },
  createdAt: {
   type: Number,
  },
  updatedAt: {
   type: Number,
  },
 },
 {
  timestamps: {
   currentTime: () => Math.floor(Date.now() / 1000),
  },
 }
);

Schema.plugin(mongoosePaginate);

export default mongoose.model("Forms", Schema);
