import { no, ta } from "zod/locales";
import { badRequestError, notFoundError } from "../../common/exeption/domain.exeption.js";
import RedisServices from "../../DB/redis/redis.services.js";
import postRebo from "../../DB/Repo/post.Rebo.js";
import userRebo from "../../DB/Repo/user.Rebo.js";
import type { createPostSchemaDto, findPostsSchemaDto, updatePostSchemaDto } from "./posts.Dto.js";
import NotificationService from "../../common/notification/notification.service.js";
import S3BucketService from "../../common/S3BUCKET/s3Bucket.service.js";
import type { Types } from "mongoose";
import type { IUser } from "../../DB/models/user.model.js";



class PostsService {


    private _postRebo = postRebo;
    private _userRebo = userRebo;
    private _redisServices = new RedisServices();
    private _notificationServices = new NotificationService();
    private _S3BucketService = new S3BucketService();

    async createPost(
        bodyData: createPostSchemaDto,
        userId: Types.ObjectId | string,
        files?: Express.Multer.File[]
    ) {

        const { tags = [] } = bodyData;

        if (tags?.length) {

            const mentionUsers = await this._userRebo.find({
                filter: { _id: { $in: tags } }
            });

            if (tags?.length !== mentionUsers.length) {
                throw new badRequestError(
                    "some of the mentioned users not found"
                );
            }
        }

        const post = this._postRebo.getDBDoc(bodyData as any);

        if (files?.length) {

            const filePaths =
                await this._S3BucketService.uploadFiles({
                    files: files as Express.Multer.File[],
                    path: `posts/${post._id}`
                });

            post.attachments = filePaths.join(",");
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
                        title: "you are mentioned in a post",
                        body: "check it out"
                    }
                });
            }
        }

        post.createdBy = userId as Types.ObjectId;

        return await post.save();
    }
    async updatePost(
        bodyData: updatePostSchemaDto,
        userId: Types.ObjectId | string,
        postId: Types.ObjectId | string,
        files?: Express.Multer.File[]
    ) {


        const Post = await this._postRebo.findOne({
            filter: { _id: postId, createdBy: userId }
        });
        if (!Post) {
            throw new notFoundError("Post not found or access denied");
        }
        if (!Post.attachments && !bodyData.content && !Post.attachments?.length && !files?.length && Post.attachments?.length == bodyData.removeFiles?.length) {
            throw new badRequestError("At least one of the fields (content, attachments) must be provided");
        }

        const { tags = [] } = bodyData;

        if (tags?.length) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            const mentionUsers = await this._userRebo.find({
                filter: { _id: { $in: tagsArray } }
            });

            if (tags?.length !== mentionUsers.length) {
                throw new badRequestError(
                    "some of the mentioned users not found"
                );
            }
        }

        let uploadFields: (string | undefined)[] = [];
        if (files?.length) {

            const filePaths =
                await this._S3BucketService.uploadFiles({
                    files: files as Express.Multer.File[],
                    path: `posts/${Post._id}`
                });

            uploadFields = filePaths
        }

        if (bodyData.removeFiles?.length) {
            await Promise.all(
                bodyData.removeFiles.map((path) =>
                    this._S3BucketService.deleteFile(path)
                )
            );
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
                        title: "you are mentioned in a post",
                        body: "check it out"
                    }
                });
            }
        }


        await Post.updateOne({
            content: bodyData.content || Post.content,
            privacyEnum: bodyData.privacyEnum || Post.privacyEnum,
        })

        return await this._postRebo.findOneAndUpdate({
            filter: { _id: postId },
            update: [

                {
                    $set: {
                        content: bodyData.content || Post.content,
                        privacyEnum: bodyData.privacyEnum || Post.privacyEnum,


                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [

                                        "$tags",
                                        bodyData.removeTags || []
                                    ]
                                },
                                bodyData.tags || []
                            ]

                        }
                        ,

                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [

                                        "$attachments",
                                        bodyData.removeFiles || []
                                    ]
                                },
                                uploadFields || []
                            ]

                        }
                    }

                }

            ],
            options: {
                updatePipeline: true,
                returnDocument: "after"
            }
        })


    }




////////////////////////////////////////updatePost //////////////////////////////////////////////////////////
    async likeDislikePost(


        postId: Types.ObjectId | string,
        react: number | string,
        user: IUser

    ) {


        const updateQuery = react == 1 
        ? {$addToSet: { likes: user._id }} : { $pull: {likes: user._id } };

        const post = await this._postRebo.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: this._postRebo.checkPostPrivacy(user)

            },
            update: updateQuery,
            options: {
                returnDocument: "after"
            }

        })

        if (!post) {
            throw new notFoundError("Post not found or access denied");
        }
        return post;
    }


    /////////////////////likeDislike//////////////////////////////////////////////////////////

 async findPosts(user: IUser, queryData: findPostsSchemaDto) {
    const searchquery = queryData.search?.length
        ? {
              content: {
                  $regex: queryData.search as string,
                  $options: "i",
              },
          }
        : {};

    return await this._postRebo.paginate({
        filter: {
            $or: this._postRebo.checkPostPrivacy(user),
            ...searchquery,
        },
      
        options: {
            populate: [
                {
                    path: "comments",
                    match: {
                        commentId: { $exists: false },
                    },
                    populate: [
                        {
                            path: "replies",
                        },
                    ],
                },
            ],
        },
          page: queryData.page as number,
        size: queryData.size as number,
    });
}

}

export default PostsService;