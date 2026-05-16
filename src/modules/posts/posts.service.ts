import { no } from "zod/locales";
import { badRequestError } from "../../common/exeption/domain.exeption.js";
import RedisServices from "../../DB/redis/redis.services.js";
import postRebo from "../../DB/Repo/post.Rebo.js";
import userRebo from "../../DB/Repo/user.Rebo.js";
import type { createPostSchemaDto } from "./posts.Dto.js";
import NotificationService from "../../common/notification/notification.service.js";



class PostsService {


    private _postRebo = postRebo;
    private _userRebo = userRebo;
    private _redisServices = new RedisServices();
    private _notificationServices = new NotificationService();



    async createPost(bodyData: createPostSchemaDto) {

        const { tags } = bodyData;
        if (tags?.length) {
            const mentionUsers = await this._userRebo.find({ filter: { _id: { $in: tags } } });
            if (tags?.length !== mentionUsers.length) {
                throw new badRequestError("some of the mentioned users not found");
            }

            for (const tag of tags) {
                const tokens = await this._redisServices.getFcmSetMembers(tag);
                if (tokens?.length) {
                    await this._notificationServices.sendNotifications({
                        tokens,
                        data: {
                            title: "you are mentioned in a post",
                            body: "check it out"
                        }
                    })
                }



            }
        }
    }


    async findPosts() {
        return await this._postRebo.find({});
    }

}

export default PostsService;