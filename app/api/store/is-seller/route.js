import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sellerStoreId = await authSeller(userId);

        if (!sellerStoreId) {
            return NextResponse.json({ isSeller: false, storeInfo: null });
        }

        const storeInfo = await prisma.store.findUnique({
            where: { id: sellerStoreId },
        });

        return NextResponse.json({
            isSeller: true,
            storeInfo,
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}