import {getAuth} from "@clerk/nextjs/server";
// get dashboard data for seller

import {NextResponse} from "next/server";
import authSeller from "@/middlewares/authSeller";
import {prisma} from "@/lib/prisma";

export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        const orders = await prisma.orders.findMany({
            where: {storeId: storeId},
        })
        const products = await prisma.product.findMany({where: {userId: userId}});
        const ratings = await prisma.rating.findMany({
            where:
                {
                    productId:
                        {in: products.map(product => product.id)}
                },
            include: {
                user:true,
                product: true,
            }
        });

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((accumulator, order)=> accumulator + order.total, 0)),
            totalProducts: products.length,

        }

        return NextResponse.json({dashboardData});


    } catch (err) {
        return NextResponse.json({error: err.message || err.code});
    }
}