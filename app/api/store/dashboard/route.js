import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get seller's storeId
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                { error: "Not authorized as seller" },
                { status: 403 }
            );
        }

        //  Run queries in parallel (faster)
        const [orders, products] = await Promise.all([
            prisma.order.findMany({
                where: { storeId },
            }),
            prisma.product.findMany({
                where: { storeId },
                select: { id: true }, // we only need IDs for ratings
            }),
        ]);

        const productIds = products.map(p => p.id);

        const ratings = await prisma.rating.findMany({
            where: {
                productId: { in: productIds },
            },
            include: {
                user: true,
                product: true,
            },
        });

        const totalEarnings = orders.reduce(
            (acc, order) => acc + (order.total || 0),
            0
        );

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(totalEarnings),
            totalProducts: products.length,
        };

        return NextResponse.json({ dashboardData });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}