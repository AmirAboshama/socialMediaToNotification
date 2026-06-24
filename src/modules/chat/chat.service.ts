import { Types } from "mongoose";
import type { IHUser } from "../../DB/models/user.model.js";
import chatRebo from "../../DB/Repo/chat.Rebo.js";
import { notFoundError } from "../../common/exeption/domain.exeption.js";
import { chatEnum } from "../../common/enums/chatEnum copy.js";
import { log } from "node:console";
import userRebo from "../../DB/Repo/user.Rebo.js";
import { randomUUID } from "node:crypto";
import S3BucketService from "../../common/S3BUCKET/s3Bucket.service.js";




class chatService {




    private _chatRepo = chatRebo
    private _userRepo = userRebo
    private _S3BucketService = new S3BucketService()
    async getChat(participantId: string, user: IHUser) {
        const chat = await this._chatRepo.findOne({
            filter: {
                participants: {
                    $all: [
                        user._id,
                        Types.ObjectId.createFromHexString(participantId)
                    ]
                },
                type: chatEnum.ovo
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "_id userName profilePicture email"
                    },
                    {
                        path: "messages.createdBy",
                        select: "_id userName profilePicture"
                    }
                ]
            }
        });

        if (!chat) {
            throw new notFoundError("no chat found ")
        }
        return { chat }


    }




    async sendMessages(bodyData: any, user: IHUser) {
        const { content, sendTo } = bodyData;

        const chat = await this._chatRepo.findOneAndUpdate({
            filter: {
                participants: {
                    $all: [user._id, Types.ObjectId.createFromHexString(sendTo)]
                }, type: chatEnum.ovo
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy: user._id
                    },

                }
            }
        })

        if (!chat) {
            await this._chatRepo.create({
                data: {
                    participants: [
                        user._id,
                        Types.ObjectId.createFromHexString(sendTo)
                    ],
                    messages: [
                        {
                            content,
                            createdBy: user._id
                        }
                    ],
                    createdBy: user._id,
                    type: chatEnum.ovo
                }
            })
        }
    }
    async sendGroupMessages(bodyData: any, user: IHUser) {
        const { content, groupId } = bodyData;

        const chat = await this._chatRepo.findOneAndUpdate({
            filter: {
                _id: groupId,
                participants: {
                    $in: [
                        user._id
                    ]
                },
                type: chatEnum.ovm
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy: user._id
                    },

                }
            }
        })

        if (!chat) {
            throw new notFoundError("no chat group found")
        }
        return  chat.roomId
    }




    // async createGroup(
    //   participants: string[],
    //   groupName: string,
    //   file: Express.Multer.File | undefined,
    //   user: IHUser
    // ) {

    //   const users = await this._userRepo.find({
    //     filter: {
    //       _id: { $in: participants }
    //     }
    //   });

    //   if (users.length !== participants.length) {
    //     throw new notFoundError('failed to find all users');
    //   }

    //   const roomId = randomUUID();

    //   let groupPath = '';

    //   if (file) {
    //     const uploadedPath = await this._S3BucketService.uploadFile({
    //       file,
    //       path: `chat/group/${roomId}`,
    //     });

    //     if (!uploadedPath) {
    //       throw new Error("File upload failed: no path returned");
    //     }

    //     groupPath = uploadedPath;
    //   }

    //   await this._chatRepo.create({
    //     data: {
    //       participants: [
    //         user._id,
    //         ...participants.map((id) => new Types.ObjectId(id))
    //       ],
    //       createdBy: user._id,
    //       type: chatEnum.ovm,
    //       group: groupName,
    //       group_image: groupPath,
    //       roomId
    //     }
    //   });
    // }


    async createGroup(
        participants: string[] | string,
        groupName: string,
        file: Express.Multer.File | undefined,
        user: IHUser
    ) {

        let rawParticipants: string[] = [];

        if (typeof participants === "string") {
            rawParticipants = participants.split(",");
        } else if (Array.isArray(participants)) {
            rawParticipants = participants.flat();
        }

        const participantIds = rawParticipants
            .map((id) => (typeof id === "string" ? id.trim() : ""))
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (!participantIds.length) {
            throw new Error("participants are required and must be valid ObjectIds");
        }

        const users = await this._userRepo.find({
            filter: {
                _id: { $in: participantIds }
            }
        });

        if (users.length !== participantIds.length) {
            throw new notFoundError("failed to find all users");
        }

        const roomId = randomUUID();

        let groupPath = "";

        // 🔥 upload group image if exists
        if (file) {
            const uploadedPath = await this._S3BucketService.uploadFile({
                file,
                path: `chat/group/${roomId}`,
            });

            if (!uploadedPath) {
                throw new Error("File upload failed: no path returned");
            }

            groupPath = uploadedPath;
        }

        // 🔥 create group chat
        await this._chatRepo.create({
            data: {
                participants: [
                    user._id,
                    ...participantIds
                ],
                createdBy: user._id,
                type: chatEnum.ovm,
                group: groupName,
                group_image: groupPath,
                roomId
            }
        });
    }


    async getGroupChat(groupId: string, user: IHUser) {
        const chat = await this._chatRepo.findOne({
            filter: {
                _id: groupId,
                participants: {
                    $in: [
                        user._id
                    ]
                },
                type: chatEnum.ovm
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "_id userName profilePicture email"
                    },
                    {
                        path: "messages.createdBy",
                        select: "_id userName profilePicture"
                    }
                ]
            }
        });

        if (!chat) {
            throw new notFoundError("no groupChat found ")
        }
        return { chat }


    }




}







export default new chatService();