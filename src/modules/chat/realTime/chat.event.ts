import z from "zod"
import { validationSockitIo } from "../../../middleWares/validationMiddleware.js"
import type { socketTypeInterface } from "../../../common/inerfaces/express.interface.js"
import { testSchema } from "../chat.validation.js"
import chatService from "../chat.service.js"
import RedisServices from "../../../DB/redis/redis.services.js"
import type { Server } from "socket.io"



class chatEvents {

  private _chatService = chatService
  private _RedisServices = new RedisServices()


  getChatEvent(socket: socketTypeInterface) {
    const testScehma = z.object({ chatId: z.string().min(2) })
    socket.on("getchat", async (args) => {
      validationSockitIo(testSchema, args)
      //  console.log( args);
      //  console.log(  testScehma.safeParse({message:args}));



    })

  }




  sendMessages(socket: socketTypeInterface, io: Server) {
    return socket.on("sendMessage", async (args) => {
      console.log(args);
      await this._chatService.sendMessages(args, socket.data.user)
      const socketIds = await this._RedisServices.getMemberSocketToIdSet(socket.data.user._id.toString())

      io.to(socketIds).emit("successMessage", args)

      const socketIdsAnotherUser = await this._RedisServices.getMemberSocketToIdSet(args.sentTo)
      if (socketIdsAnotherUser.length) {

        io.to(socketIdsAnotherUser).emit("newMessage", {
          content: args.content,
          from: socket.data.user

        })
      }
      io.to(socketIds).emit("newMessage", args)

    })
  }
  sendGroupMessage(socket: socketTypeInterface, io: Server) {
    return socket.on("sendMessage", async (args) => {
      console.log(args);
      const roomId = await this._chatService.sendGroupMessages(args, socket.data.user)
      const socketIds = await this._RedisServices.getMemberSocketToIdSet(socket.data.user._id.toString())

      io.to(socketIds).emit("successMessage", {
        content: args.content,
        sendTo: args.groupId,
      })
      io.to(roomId).emit("newMessage", {
        content: args.content,
        from: socket.data.user,
        groupId: args.groupId
      })


    })
  }
  joinRoom(socket: socketTypeInterface, io: Server) {
    return socket.on("join-room", async (args) => {

      socket.join(args.roomId)

    })
  }

}



export default new chatEvents()