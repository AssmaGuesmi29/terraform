import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, email } = await req.json();
        const newUser = await prisma.user.create({
            data: { name, email },
        });
        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
