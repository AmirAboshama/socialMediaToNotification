import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"
import { genderEnum, providerEnum, roleEnum } from "../../../common/enums/userEnum.js";


export const userProfileType= new GraphQLObjectType({
          name: "UserProfileData",
          fields: {
            _id: { type: new GraphQLNonNull(GraphQLID) },
            userName: { type: GraphQLString },
            email: { type: GraphQLString },
            confirmEmail: { type: GraphQLBoolean },
            password: { type: GraphQLString },
            age: { type: GraphQLInt },
            phone: { type: GraphQLString },

            provider: {
              type: new GraphQLEnumType({
                name: "providerEnum",
                values: {
                  google: { value: providerEnum.google },
                  system: { value: providerEnum.system },
                },
              }),
            },

            gender: {
              type: new GraphQLEnumType({
                name: "genderEnum",
                values: {
                  male: { value: genderEnum.male },
                  female: { value: genderEnum.female },
                },
              }),
            },

            role: {
              type: new GraphQLEnumType({
                name: "roleEnum",
                values: {
                  User: { value: roleEnum.User },
                  Admin: { value: roleEnum.Admin },
                },
              }),
            },

            profilePicture: { type: GraphQLString },
            coverPicture: { type: new GraphQLList(GraphQLString) },
            friends: { type: new GraphQLList(GraphQLString) },
            changeCredential: { type: GraphQLString },
          },
        })