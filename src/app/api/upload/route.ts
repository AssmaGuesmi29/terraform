import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import {createS3Client} from "@/lib/s3";
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
            throw new Error('Configuration AWS manquante dans .env.local');
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const originalFilename = file.name;

        const mimetype = file.type || 'application/octet-stream';
        console.log("mimetype",mimetype)

        const timestamp = new Date().toISOString();
        const hmac = crypto.createHmac('sha256', timestamp);
        hmac.update(originalFilename);
        const hash = hmac.digest('hex');

        const fileExt = path.extname(originalFilename);
        const fileKey = `${hash}${fileExt}`;

        const s3 = createS3Client();

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey,
                Body: buffer,
                ContentType: mimetype,
            })
        );

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        return NextResponse.json({
            url: fileUrl,
            name: originalFilename,
            key: fileKey,
            mimetype,
        });

    } catch (error) {
        console.error('❌ Erreur upload :', error);
        return NextResponse.json({ error: 'Échec de l\'upload' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
            throw new Error('Configuration AWS manquante dans .env.local');
        }

        const s3 = createS3Client();
        const data = await s3.send(
            new ListObjectsV2Command({
                Bucket: process.env.AWS_BUCKET_NAME,
            })
        );

        const files = (data.Contents || []).map(obj => ({
            key: obj.Key,
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
        }));

        return NextResponse.json(files);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des fichiers :', error);
        return NextResponse.json({ error: 'Échec de la récupération des fichiers' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
            throw new Error('Configuration AWS manquante dans .env.local');
        }

        const url = new URL(req.url);
        const key = url.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ error: 'Clé du fichier manquante' }, { status: 400 });
        }

        const s3 = createS3Client();

        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            })
        );

        return NextResponse.json({ message: `Fichier ${key} supprimé avec succès` });
    } catch (error) {
        console.error('❌ Erreur lors de la suppression du fichier :', error);
        return NextResponse.json({ error: 'Échec de la suppression du fichier' }, { status: 500 });
    }
}
