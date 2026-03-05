import {getAuth} from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";


// add new address
export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        const {address} = await req.json();
        address.userId = userId;


        const newAddress = await prisma.address.create({
            data: address,
        })

        return NextResponse.json({newAddress, message: "address created successfully."})

    } catch (e) {
        console.log(e)
        return NextResponse.json({error: e.message}, {status: 400})

    }

}

// get all the address for a user
export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);



        const addresses = await prisma.address.findMany({where: {userId: userId}})

        return NextResponse.json({addresses})

    } catch (e) {
        console.log(e)
        return NextResponse.json({error: e.message}, {status: 400})

    }

}