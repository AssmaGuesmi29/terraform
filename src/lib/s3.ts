import { S3Client } from '@aws-sdk/client-s3';

const {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY
} = process.env;

export function createS3Client() {
    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        throw new Error('Missing AWS S3 environment variables');
    }

    const s3 = new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
    });

    return s3;
}
