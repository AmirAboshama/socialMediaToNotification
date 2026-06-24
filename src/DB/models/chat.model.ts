import { Schema, Types, type HydratedDocument } from "mongoose";
import { model } from "mongoose";
import { chatEnum } from "../../common/enums/chatEnum copy.js";
import type { postPrivacyEnum } from "../../common/enums/postEnum.js";
import { required } from "zod/mini";



export interface Imessages {

  content?: string;
  attachments?: string;
  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  privacyEnum?: postPrivacyEnum;
  deleteAt?: Date;
  createdBy?: Types.ObjectId;

}
export interface Ichat {


  participants: Types.ObjectId[];
  messages: Imessages[];
  type: chatEnum

  /////group//////////////

  group: string;
  group_image: string;
  roomId: string;
  deleteAt?: Date;
  createdBy?: Types.ObjectId;

}

export type HIchat = HydratedDocument<Ichat>;
const messageSCEMA = new Schema<Imessages>(
  {


    content: {
      type: String, required: function (): boolean {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deleteAt: Date




  }, {
  timestamps: true,



  toObject: { virtuals: true },
  toJSON: { virtuals: true }



}
)

const chatSCEMA = new Schema<Ichat>(
  {


   
  participants:[ {type:Types.ObjectId,ref:"User",required:true}],
  messages: [messageSCEMA],
  type: {type:String,enum:chatEnum ,default:chatEnum.ovo} ,

  /////group//////////////

  group: {type:String,required: function (this: any): boolean {
  return this.type === chatEnum.ovm;
}},
  group_image: {type:String,required: function (this: any): boolean {
  return this.type === chatEnum.ovm;
}},
  roomId: {type:String,required:true},
  deleteAt: Date,
  createdBy: {type:Types.ObjectId,ref:"User",required:true}




  }, {
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
)






chatSCEMA.pre(['findOne', 'find'], function () {
  console.log(this.getQuery());
  const query = this.getQuery();
  if (!query.getSoftDelete) {
    this.setQuery({ ...query, deleteAt: { $exists: false } })
  }

})




// 3. Create a Model.
const chatModel = model<Ichat>('chat', chatSCEMA);

export default chatModel;