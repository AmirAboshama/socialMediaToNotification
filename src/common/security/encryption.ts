import CryptoJS   from "crypto-js";
import { EMCRYPTION_KEY } from "../../config/config.service.js";
 
export function encryptionValue({value, key = EMCRYPTION_KEY}:{value:string, key?:string}){
    return CryptoJS.AES.encrypt(value, key ).toString();
}
export function dencryptionValue({ciphertext,key = EMCRYPTION_KEY}:{ciphertext:string,key?:string}){
   var bytes  = CryptoJS.AES.decrypt(ciphertext, key);
var originalText = bytes.toString(CryptoJS.enc.Utf8);
return originalText
}