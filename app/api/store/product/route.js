import {getAuth} from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import {NextResponse} from "next/server";
import imagekit from "@/configs/imagekit";
import {prisma} from "@/lib/prisma";
import {store} from "next/dist/build/output/store";

// add new product

export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "not authorized store"}, {status: 401});
        }

        // get the data from the form

        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const images = formData.getAll("images");

        if (!name || !description || !mrp || !price || !category || !images) {
            return NextResponse.json({message: "provide more information about the product"},{status: 401});
        }

        const imageUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imagekit.upload({
                file: buffer,
                filename: `${name}-${image.name}`,
                folder: 'products',
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation:[
                    {quality: "auto"},
                    {format:"webp"},
                    {width:"1024"}
                ]
            })
        }))

        await prisma.product.create({
            data:{
                name,
                description,
                mrp,
                price,
                category,
                images: imageUrl,
                storeId
            }
        })

        return NextResponse.json({message: "product added successfully"});



    } catch (e) {
        return NextResponse.json({error: e.message || e.code});

    }
}

// get all product for a seller
export async function GET(req, res) {
    try{

        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "not authorized store"}, {status: 401});
        }

        const products = await prisma.product.findMany({
            where: {storeId: storeId},
        })

        return NextResponse.json({message: "product fetched successfully"});

    }catch(err){

    }
}