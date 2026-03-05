import {getAuth} from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


//update seller order status
export async function POST(req, res) {
    try{
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized! No store found."}, {status:401});
        }

        const {orderId, status} = await req.json();
        await prisma.order.update({
            where: {
                id: orderId, storeId
            },
            data: {
                status,
            }
        })
        return NextResponse.json({message: "Successfully updated."});
    }catch(error){
        return NextResponse.json({error: error.code || error.message}, {status: 400});
    }
}

// get list of all for a specific seller


export async function GET(req, res) {
    try{
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "Not authorized! No store found."}, {status:401});
        }

        const orders = await prisma.order.findMany({
            where: {
                storeId
            },
            include: {user: true, address: true, orderItems: {include: {product: true}}},
            orderBy:{createdAt: "desc"}
        })

        return NextResponse.json({orders});

    }catch(error){
        return NextResponse.json({error: error.code || error.message}, {status: 400});

    }
}