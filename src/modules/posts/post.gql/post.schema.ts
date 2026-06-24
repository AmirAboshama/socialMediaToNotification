
import { reactPostArgs } from "./post.args.js";
import { reactPostType } from "./post.type.js";
import  reactPosdtResolver  from "./post.resolvers.js";



class reactPostSchema {

    postMutation() {
        return {
            getReactPost: {
                description: "this for testing",

                type: reactPostType,
                args:reactPostArgs
                ,

                resolve:reactPosdtResolver.reactPost
            },
        };
    }
}

export default new reactPostSchema()