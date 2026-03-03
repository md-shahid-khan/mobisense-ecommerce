import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


// approve seller


export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Authentication error! user is not admin",});
        }

        const {storeId, status} = await req.json();
        if (status === "approved") {
            await prisma.store.update({
                where: {id: storeId},
                data: {
                    status: "approved", isActive: true
                }
            })
        } else if (status === "rejected") {
            await prisma.store.update({
                where: {id: storeId},
                data: {
                    status: "rejected",
                }
            })
        }

        return NextResponse.json({message: status + "succeeded"});

    } catch (err) {
        console.log(err);
        return NextResponse.json({message: err.message || "Only Administrator can approved",});
    }
}

// getting all rejected and pending stores
export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Authentication error! user is not admin",});
        }

        const stores = await prisma.store.findMany({
            where: {status: {in: ["pending", "rejected"]}},
            include: {user: true}
        })

        return NextResponse.json({stores});
    } catch (err) {
        return NextResponse.json({message: err.message});
    }
}