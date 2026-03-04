import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Authentication error! user is not admin" },
                { status: 401 }
            );
        }

        const { storeId } = await req.json();

        if (!storeId) {
            return NextResponse.json(
                { error: "Missing storeId" },
                { status: 400 }
            );
        }


        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }


        await prisma.store.update({
            where: { id: storeId },
            data: {
                isActive: !store.isActive,
            },
        });

        return NextResponse.json({
            message: "Store updated successfully",
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}