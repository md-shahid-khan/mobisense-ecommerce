import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import imagekit from "@/configs/imagekit"

export async function POST(req) {
    try {
        const { userId } = getAuth(req)

        const formData = await req.formData()
        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")

        if (!name || !username || !description || !email || !contact || !image) {
            return NextResponse.json({ error: "Missing store details" }, { status: 400 })
        }

        // Check if user already has a store
        const existingStore = await prisma.store.findUnique({ where: { userId } })
        if (existingStore) return NextResponse.json({ status: existingStore.status })

        // Check if username is already taken
        const isUsernameTaken = await prisma.store.findUnique({ where: { username: username.toLowerCase() } })
        if (isUsernameTaken) return NextResponse.json({ error: "Username already taken" }, { status: 400 })

        // Upload image to ImageKit
        const buffer = Buffer.from(await image.arrayBuffer())
        const uploadRes = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos",
        })

        const logoUrl = imagekit.url({
            path: uploadRes.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "512" },
            ],
        })

        // Create store using Prisma relation
        const newStore = await prisma.store.create({
            data: {
                name,
                description,
                username: username.toLowerCase(),
                address,
                email,
                contact,
                logo: logoUrl,
                user: { connect: { id: userId } }, // key fix here
            },
        })

        return NextResponse.json({ message: "Store created successfully! Wait for approval" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error.message || error.code }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user already has a store
        const store = await prisma.store.findFirst({ where: { userId } });

        if (store) {
            return NextResponse.json({ status: store.status });
        }

        return NextResponse.json({ status: "not registered" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}