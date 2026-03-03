import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


// toggle store is active
export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Authentication error! user is not admin",});
        }

        const storeId = await req.json();
        if (!storeId) {
            return NextResponse.json({error: "missing storeId"});
        }

        //find the store
        const store = await prisma.store.findMany({
            where: {id: storeId}
        })

        if (!store) {
            return NextResponse.json({error: "store not found"});
        }

        await prisma.store.update({
            where: {id: storeId},
            data: {
                isActive: !store.isActive
            }
        })

        return NextResponse.json({message: "Store updated successfully",});


    } catch (err) {
        return NextResponse.json({message: err.message});
    }
}