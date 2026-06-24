import {
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";

const reactEnum = new GraphQLEnumType({
  name: "ReactEnum",
  values: {
    like: {
      value: 1,
    },
    unlike: {
      value: 0,
    },
  },
});

export const reactPostArgs = {
  postId: {
    type: new GraphQLNonNull(GraphQLString),
  },
  react: {
    type: new GraphQLNonNull(reactEnum),
  },
};