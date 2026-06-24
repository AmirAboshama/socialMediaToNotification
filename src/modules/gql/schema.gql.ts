import { GraphQLObjectType, GraphQLSchema } from "graphql";
import userSchema from "../user/gql/user.schema.js";
import reactPostSchema from "../posts/post.gql/post.schema.js";


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "querySchema",
        fields: {
            ...userSchema.userQuries()
        },
    }),
    mutation: new GraphQLObjectType({
        name: "mutatiionSchema",
        fields: {
            ...reactPostSchema.postMutation()
        },
    }),
});



export default schema