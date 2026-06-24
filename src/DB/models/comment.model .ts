import { Schema, Types, type HydratedDocument } from "mongoose";
import { model } from "mongoose";
import type { Ipost } from "./post.model.js";

export interface Icomment {



  content?: string;
  attachments?: string;
  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  postId?: Types.ObjectId | Ipost;
  commentId?: Types.ObjectId;
  deleteAt?: Date;
  createdBy?: Types.ObjectId;




}

export type HIcomment = HydratedDocument<Icomment>;


const commentSCEMA = new Schema<Icomment>(
  {


    content: {
      type: String, required: function (): boolean {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],




    commentId: [{ type: Types.ObjectId, ref: "Comment" ,required: true }],
    postId: [{ type: Types.ObjectId, ref: "Post" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deleteAt: Date




  }, {
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
)

// 3. soft delete   .



commentSCEMA.pre(['findOne', 'find'], function () {
  console.log(this.getQuery());
  const query = this.getQuery();
  if (!query.getSoftDelete) {
    this.setQuery({ ...query, deleteAt: { $exists: false } })
  }

})




   commentSCEMA.virtual ("replies",
  {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentId",
    justOne: true
  }
)

// 3. Create a Model.
const commentModel = model<Icomment>('Comment', commentSCEMA);

export default commentModel;