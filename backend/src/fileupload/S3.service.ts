import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';
@Injectable()
export class S3Service {
  private _S3;
  public constructor() {
    this._S3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }
  async uploadFile(file: Express.Multer.File, keyValue: string) {
    const bucket = process.env.AWS_BUCKET as string;
    const params = {
      Bucket: bucket,
      Key: keyValue,
      ContentDisposition: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    };
    return new Promise((resolve, reject) => {
      this._S3.upload(params, (err: any, data: any) => {
        if (err) {
          console.log(err.message);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  async deleteFiles(keys: any) {
    const bucket = process.env.AWS_BUCKET as string;
    return new Promise((resolve, reject) => {
      this._S3
        .deleteObjects(
          { Bucket: bucket, Delete: { Objects: keys } },
          async function (error) {
            if (error != null) {
              reject('Failed to delete object from S3: ' + error);
            }
          }
        )
        .on('success', (response) => {
          resolve(response.data);
        });
    });
  }
}
