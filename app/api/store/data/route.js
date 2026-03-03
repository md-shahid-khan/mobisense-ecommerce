

// get store info and store product

import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req, res){
    try{
        //get store username from query params
        const {searchParams} = new URL(req.url);
        const username = searchParams.get("username").toLowerCase();
        if(!username){
            return NextResponse.json({error:"missing username"}, {status: 400});
        }

        const store = await prisma.store.findUnique({
            where:{username: username, isActive: true},
            include: {Product: {include: {rating:true}}}
        })

        if(!store){
            return NextResponse.json({message:"no store found"});
        }
        return NextResponse.json({store});

    }catch(err){
        return NextResponse.json({error: err.message || err.code});
    }
}