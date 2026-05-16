import { DeleteObjectCommand, GetObjectAclCommand, GetObjectCommand, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { REGION, APPLICATION_NAME, BUCKET_NAME, ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "../../config/config.service.js";
import { Upload } from "@aws-sdk/lib-storage";
import { storageApproachesEnum } from "../enums/multerEnum.js";
import { createReadStream } from "fs";
import e from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

class S3BucketService {
    private _client = new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
        }
    })



   async createPresignedUrl({
  originalName,
  contentType,
  path,
}: {
  originalName: string;
  contentType: string;
  path: string;
}) {

  const key = `${APPLICATION_NAME}/${path}/${randomUUID()}_${originalName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: ObjectCannedACL.private,
  });

  const url = await getSignedUrl(this._client, command, { expiresIn: 3600 });

  return { url, key };
}

    async uploadFile({
        file,
        path
    }: {
        file: Express.Multer.File;
        path: string;
    }) {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: ObjectCannedACL.private,
        });

        await this._client.send(command);

        return command.input.Key;
    }

    async uploadFiles({
        files,
        path,
        uploadApproach = storageApproachesEnum.Memory
    }: {
        files: Express.Multer.File[];
        path: string;
        uploadApproach?: storageApproachesEnum;
    }) {

        const keys = await Promise.all(
            files.map((file) =>
                uploadApproach === storageApproachesEnum.Memory
                    ? this.uploadFile({ file, path })
                    : this.uploadLargeFile({
                        file,
                        path,
                        UploudApproach: storageApproachesEnum.Disk
                    })
            )

        );
        return keys;
    }

    async uploadLargeFile({ file, path, UploudApproach = storageApproachesEnum.Disk }: { file: Express.Multer.File, path: string, UploudApproach?: storageApproachesEnum }) {
        const commend = new Upload({
            client: this._client,
            params: {
                Bucket: BUCKET_NAME,
                Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
                Body: file.buffer ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype,
                ACL: ObjectCannedACL.private,
            },
            // partSize: 5 ,
            // queueSize: 4, // عدد الأجزاء التي يتم تحميلها في نفس الوقت
        });

        commend.on("httpUploadProgress", (progress) => {
            console.log(`Upload progress: ${(progress.loaded as number) / (progress.total as number) * 100}%`);
        });

        const data = await commend.done();
        console.log("Upload completed successfully:", data);
        return data.Key
    }


    async getFile({ Key, }: { Key: string }) {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key, // ✅ صح
        });
        return await this._client.send(command);

    }
    async createPresignedgetFile({ Key, download, fileName }: { Key: string, download?: boolean, fileName?: string }) {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key, // ✅ صح
            ResponseContentDisposition: download? `attachment; filename="${ fileName || Key.split("/").pop()}"` : undefined, // لتحديد اسم الملف عند التحميل
        });
        return await getSignedUrl(this._client, command, { expiresIn: 3600 });

    }

    async deleteFile(Key: string) {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key, // ✅ صح
        });
        return await this._client.send(command);
    }

}

export default S3BucketService;