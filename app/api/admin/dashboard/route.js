import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { message: "Admin does not exist" },
                { status: 401 }
            );
        }

        // 🚀 Run queries in parallel (faster)
        const [orders, stores, products, revenueData, allOrders] =
            await Promise.all([
                prisma.order.count(),
                prisma.store.count(),
                prisma.product.count(),
                prisma.order.aggregate({
                    _sum: { total: true },
                }),
                prisma.order.findMany({
                    select: {
                        createdAt: true,
                        total: true,
                    },
                }),
            ]);

        // ✅ Safe revenue calculation
        const revenue = (revenueData._sum.total || 0).toFixed(2);

        return NextResponse.json({
            dashboardData: {
                orders: orders || 0,
                stores: stores || 0,
                products: products || 0,
                revenue,
                allOrders: allOrders || [], // ✅ never undefined
            },
        });

    } catch (err) {
        console.error("Dashboard Error:", err);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}