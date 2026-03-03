import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";


// get all approved store
export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Authentication error! user is not admin",});
        }

        const stores = await prisma.store.findMany({
            where: {status: "approved"},
            include: {user: true}
        })

        return NextResponse.json({stores});
    } catch (err) {
        return NextResponse.json({message: err.message});
    }
}