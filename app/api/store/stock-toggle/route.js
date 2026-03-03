import {getAuth} from "@clerk/nextjs/server"
import {NextResponse} from "next/server";
import authSeller from "@/middlewares/authSeller";
import {prisma} from "@/lib/prisma";
// toggle stock of a prduct

export async function POST(req, res) {
    try{
        const {userId}  = getAuth(req);
        const {productId} = await req.json();
        if(!productId){
            return NextResponse.json({error: "missing product details: prudct not found"});
        }

        const storeId = await authSeller(userId);

        if(!storeId){
            return NextResponse.json({error:"not authorized"});
        }
        //check if product is already exists
        const product = await prisma.product.findFirst({
            where:{id: productId, storeId: storeId},
        })
        if(!product){
            return NextResponse.json({error:"no product found"}, {status:401});
        }

        await prisma.product.update({
            where:{id: productId},
            data: {
                inStock: !product.inStock,
            }
        })
        return NextResponse.json({message: "product stock updated successfully"});
    }catch(err){
        return NextResponse.json({error: err.message || err.code});
    }
}