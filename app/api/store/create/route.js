import {getAuth} from "@clerk/nextjs/server"
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import imagekit from "@/configs/imagekit";

export async function POST(req, res) {
    try {
        const {userId} = getAuth(req);
        // get the data from the form
        const formData = await req.formData()
        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");
        if (!name || !username || !description || !email || !contact || !email || image) {
            return NextResponse.json({error: "missing store details"}, {status: 400});
        }
        // checking is user have already registered a store
        const store = await prisma.create.store.findFirst({
            where: {userId: userId},
        })
        // if store is already created then send status of store
        if (store) {
            return NextResponse.json({status: store.status});
        }
        //check if username is already taken by someone
        const isUsernameTaken = await prisma.store.findFirst({
            where: {username: username.toLowerCase()}
        })
        if (isUsernameTaken) {
            return NextResponse.json({error: "username already taken"}, {status: 400});
        }

        // image should base64 or binary
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizeImage = imagekit.url({
            path: response.filePath,
            transformation: [
                {
                    quality: "auto",

                },
                {
                    format: "webp",
                },
                {
                    width: "512"
                }
            ]
        })

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizeImage,

            }
        })

        //linking store to user
        await prisma.store.update({
            where: {id: userId},
            data: {
                store: {connect: {id: newStore.id}},
            }
        })

        return NextResponse.json({message: "Store created successfully! Wait for the Approval"}, {status: 200});

    } catch (error) {
        return NextResponse.json({message: error.message || error.code}, {status: 500});
    }
}

// check is user have already registered a store if yes then send status of store
export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        // checking is user have already registered a store
        const store = await prisma.create.store.findFirst({
            where: {userId: userId},
        })
        // if store is already created then send status of store
        if (store) {
            return NextResponse.json({status: store.status});
        }

        return NextResponse.json({status: "not registered"});


    } catch (error) {
        return NextResponse.json({message: error.message || error.code}, {status: 500});
    }
}