import { connect } from "mongoose";
import { DB_URL_ATLAS } from "../config/config.service.js";


async function testConnection() {

    try {
          await connect(DB_URL_ATLAS);
            console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
export default testConnection;