import {getAuth} from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";


export async function POST(req, res) {
    try{
        const {userId} = getAuth(req);
        const { cart } = await req.json();

        //save the cart to the user
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                cart: cart
            }
        })

        return NextResponse.json({
            message: "Successfully updated cart"
        })

    }catch(e){
        console.log(e)
        return NextResponse.json({error: e.message}, {status: 400})

    }
}

// get user cart

export async function GET(req, res) {
    try{
        const {userId} = getAuth(req);

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        return NextResponse.json({cart: user.cart})

    }catch(e){
        console.log(e)
        return NextResponse.json({error: e.message}, {status: 400})

    }
}