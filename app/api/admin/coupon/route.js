// add new coupon
import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {inngest} from "@/inngest/client";

export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});

        }

        const {coupon} = await req.json();
        coupon.code = coupon.code.toUpperCase();
        await prisma.coupon.create({
            data: coupon
        }).then(async (coupon) => {
            // run inngest scheduler for delete coupon on expire
            await inngest.send({
                name:"app/coupon.expired",
                data:{
                    code: coupon.code,
                    expires_at:coupon.expires_at
                }
            })
        })

        return NextResponse.json({message: "Successfully created coupon"})


    } catch (e) {
        return NextResponse.json({error:e.message})

    }
}

// delete coupon /api/coupon?id=couponId

export async function DELETE(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"})
        }
        const {searchParams} = req.nextUrl;
        const code = searchParams.get("code");
        await prisma.coupon.delete({
            where: {id: code}
        })
        return NextResponse.json({message: "Successfully deleted coupon"})
    } catch (e) {
        return NextResponse.json({error: e.message})

    }
}

// get all list of coupon

export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Not authorized"})
        }
        const coupons = await prisma.coupon.findMany({});
        return NextResponse.json({coupons: coupons})

    } catch (e) {
        return NextResponse.json({error: e.message})

    }

}