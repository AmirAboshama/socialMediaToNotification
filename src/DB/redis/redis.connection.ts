import { createClient } from "redis"
import { REDIS_CONNECTION } from "../../config/config.service.js";

 export const client = createClient({
  url:REDIS_CONNECTION
});

async function testRedisConnection (){
    try {
      await  client.connect();
  console.log(' Redis Connected!')
    } catch (error) {
        console.log(" Redis connection error ",error);
        
    }
}

export default testRedisConnection