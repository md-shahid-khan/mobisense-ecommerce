import {getAuth} from "@clerk/nextjs/server"
import authSeller from "@/middlewares/authSeller";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

//auth seller

export async function GET(req, res) {
    try{
        const {userId} = getAuth(req);
        const isSeller = await authSeller(userId);

        if(!isSeller){
            return NextResponse.json({error: "not authorized"});
        }

        const storeInfo = await prisma.store.findUnique({
            where:{userId: userId},
        })
        return NextResponse.json({isSeller: isSeller, storeInfo});

    }catch(err){
        return NextResponse.json({error: err.message || err.code});
    }
}