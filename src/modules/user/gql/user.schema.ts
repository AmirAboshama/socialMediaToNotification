
import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from "graphql";
import userResolvers from "./user.resolvers.js";
import { userProfileType } from "./user.type.js";
import { getProfileArgs } from "./user.args.js";


class userSchema {

    userQuries() {
        return {
            getUserProfile: {
                description: "this for testing",

                type: userProfileType,
                args:getProfileArgs,

                resolve: userResolvers.userProfile
            },
        };
    }
}

export default new userSchema()