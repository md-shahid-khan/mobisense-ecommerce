// add new coupon
import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {inngest} from "@/inngest/client";

export async function POST(req, res) {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { coupon } = await req.json();
        coupon.code = coupon.code.toUpperCase();
        coupon.expiresAt = new Date(coupon.expiresAt); // ensure Date

        const createdCoupon = await prisma.coupon.create({
            data: coupon
        });

        // schedule deletion
        await inngest.send({
            name: "app/coupon.expired",
            data: {
                code: createdCoupon.code,
                expires_at: createdCoupon.expiresAt.toISOString() // always ISO string
            }
        });

        return NextResponse.json({ message: "Successfully created coupon" });

    } catch (e) {
        return NextResponse.json({ error: e.message });
    }
}

// delete coupon /api/coupon?id=couponId

export async function DELETE(req, res) {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: "Not authorized" });
        }

        const { searchParams } = req.nextUrl;
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
        }

        await prisma.coupon.delete({
            where: { code } // delete by code
        });

        return NextResponse.json({ message: "Successfully deleted coupon" });

    } catch (e) {
        return NextResponse.json({ error: e.message });
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