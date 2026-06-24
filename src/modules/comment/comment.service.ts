import type { Types } from "mongoose";
import S3BucketService from "../../common/S3BUCKET/s3Bucket.service.js";
import RedisServices from "../../DB/redis/redis.services.js";
import postRebo from "../../DB/Repo/post.Rebo.js";
import { badRequestError } from "../../common/exeption/domain.exeption.js";
import commentRebo from "../../DB/Repo/comment.Rebo.js";
import NotificationService from "../../common/notification/notification.service.js";
import type { IHUser } from "../../DB/models/user.model.js";
import type { Ipost } from "../../DB/models/post.model.js";




class commentService {


    private _commentRebo = commentRebo;
    private _postRebo = postRebo;
    private _redisServices = new RedisServices();
    private _notificationServices = new NotificationService();
    private _S3BucketService = new S3BucketService();



    async createComment(
        bodyData: any,
        user: IHUser,
        postId: Types.ObjectId | string,
        files?: Express.Multer.File[]
    ) {

        const { tags = [] } = bodyData;

        const post = await this._postRebo.findOne({
            filter: {
                _id: postId,
                $or: this._postRebo.checkPostPrivacy(user)

            },

        });

        if (!post) {
            throw new badRequestError("post not found or you don't have access to it");
        }


        const comment = this._commentRebo.getDBDoc(bodyData as any);



        if (tags?.length) {

            const mentionUsers = await this._commentRebo.find({
                filter: { _id: { $in: tags } }
            });

            if (tags?.length !== mentionUsers.length) {
                throw new badRequestError(
                    "some of the mentioned users not found"
                );
            }
        }


        if (files?.length) {

            const filePaths =
                await this._S3BucketService.uploadFiles({
                    files: files as Express.Multer.File[],
                    path: `posts/${comment.postId}/comments/${comment._id}`
                });

            comment.attachments = filePaths.join(",");
        }

        for (const tag of tags) {

            const tokens =
                await this._redisServices.getFcmSetMembers(
                    tag.toString()
                );

            if (tokens?.length) {

                await this._notificationServices.sendNotifications({
                    tokens,
                    data: {
                        title: "you are mentioned in a comment",
                        body: JSON.stringify({
                            msg: "you are mentioned in a comment",
                            commentId: comment._id
                        })
                    },
                });
            }
        }

        comment.createdBy = user._id as Types.ObjectId;
        comment.postId = postId as Types.ObjectId;
        return await comment.save();
    }
    async createReplyComment(
        bodyData: any,
        user: IHUser,
        postId: Types.ObjectId | string,
        commentId: Types.ObjectId | string,
        files?: Express.Multer.File[]
    ) {



        const { tags = [] } = bodyData;
        //
        //         const post = await this._postRebo.findOne({
        //             filter: {
        //                 _id: postId,
        //                 $or: this._postRebo.checkPostPrivacy(user)

        //             },

        //         });

        //         if (!post) {
        //             throw new badRequestError("post not found or you don't have access to it");
        //         }

        //         const preComment = await this._commentRebo.findById({ id: commentId })
        //         if (!preComment) {
        //             throw new badRequestError("preComment not found")
        //         }
        //    


        const parentComment = await this._commentRebo.findOne({

            filter: {
                _id: commentId,
                postId
            }
            ,
            options: {
                populate: [{
                    path: 'postId', match: {
                        $or: this._postRebo.checkPostPrivacy(user)
                    }
                }]
            }

        })

        if (!parentComment || !(parentComment.postId as Ipost)) {
            throw new badRequestError("preComment not found or you don't have access to it")
        }




        const comment = this._commentRebo.getDBDoc(bodyData as any);

        if (!comment) {
            throw new badRequestError("comment not found")
        }

        if (tags?.length) {

            const mentionUsers = await this._commentRebo.find({
                filter: { _id: { $in: tags } }
            });

            if (tags?.length !== mentionUsers.length) {
                throw new badRequestError(
                    "some of the mentioned users not found"
                );
            }
        }


        if (files?.length) {

            const filePaths =
                await this._S3BucketService.uploadFiles({
                    files: files as Express.Multer.File[],
                    path: `posts/${comment.postId}/comments/${comment._id}`
                });

            comment.attachments = filePaths.join(",");
        }

        for (const tag of tags) {

            const tokens =
                await this._redisServices.getFcmSetMembers(
                    tag.toString()
                );

            if (tokens?.length) {

                await this._notificationServices.sendNotifications({
                    tokens,
                    data: {
                        title: "you are mentioned in a comment",
                        body: JSON.stringify({
                            msg: "you are mentioned in a comment",
                            commentId: comment._id
                        })
                    },
                });
            }
        }

        comment.createdBy = user._id as Types.ObjectId;
        comment.postId = postId as Types.ObjectId;
        comment.commentId = commentId as Types.ObjectId;
        return await comment.save();
    }
    async getComment(
        commentId: Types.ObjectId | string,
        user: IHUser) {




        const comment = await this._commentRebo.findById({

            id: commentId,

            options: {
                populate: [{
                    path: 'postId', match: {
                        $or: this._postRebo.checkPostPrivacy(user)
                    }
                }
            ,
        {
            path: 'commentId' 
        },
        {
            path: 'replies' 
        }
    
    
    
    
    ]
            }
        });


if (!comment || !comment.postId) {
    throw new badRequestError("post not found or you don't have access to it");
}
        return comment;
    };



}

export default commentService;