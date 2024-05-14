import * as crypto from 'crypto';
import { decrypt } from 'dotenv';

// Encryption
const algorithm: string = 'aes-256-cbc';
// const key: Buffer = crypto.randomBytes(32);
// const iv: Buffer = crypto.randomBytes(16); 

const key: Buffer = Buffer.from('e6c84f4cf2e4c607e5365941d1ff57747987808a471d6d1eb969ba86b1a6fe2b','hex');
const iv: Buffer = Buffer.from('ba95b616f4543fd806801f96bd4e5b3b', 'hex');

export const encryptData = (data:string):string =>{
    const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedData: string = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData
}

export const decryptData = (data:string):string =>{
    const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData: string = decipher.update(data, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}
