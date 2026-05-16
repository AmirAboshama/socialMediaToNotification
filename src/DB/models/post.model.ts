import { Schema, Types, type HydratedDocument } from "mongoose";
import { postPrivacyEnum } from "../../common/enums/postEnum.js";
import { model } from "mongoose";
import { th } from "zod/locales";

export interface Ipost {



    content?: string;
    attachments?: string;
    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    privacyEnum?: postPrivacyEnum;
    deleteAt?: Date;
    createdBy?: Types.ObjectId;




}

export type HIpost =HydratedDocument<Ipost>


const postSCEMA = new Schema<Ipost>(
  {


    content: { type: String, required:function (): boolean {
        return !this.attachments?.length;
    },} ,
    attachments:  [String] ,
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    privacyEnum: { type: String, enum: Object.values(postPrivacyEnum) , default: postPrivacyEnum.PUBLIC },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deleteAt: Date 




    },{
    timestamps:true
    }
)

// 3. soft delete   .



postSCEMA.pre(['findOne','find'], function () {
   console.log(this.getQuery());
   const query = this.getQuery();
   if(!query.getSoftDelete){
     this.setQuery ({ ...query, deleteAt: { $exists: false } })
   }
   
})

// 3. Create a Model.
const postModel = model<Ipost>('Post', postSCEMA);

export default postModel;