import { getAuth } from "@clerk/nextjs/server"; // ✅ correct App Router usage
import authSeller from "@/middlewares/authSeller";
import { NextResponse } from "next/server";
import imagekit from "@/configs/imagekit";
import { prisma } from "@/lib/prisma";

// Add new product
export async function POST(req) {
    try {
        const { userId } = getAuth(req); // ✅ get Clerk user
        if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

        const storeId = await authSeller(userId);
        if (!storeId) return NextResponse.json({ error: "Not authorized store" }, { status: 401 });

        const formData = await req.formData();
        const name = formData.get("name")?.toString();
        const description = formData.get("description")?.toString();
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category")?.toString();
        const images = formData.getAll("images");

        if (!name || !description || !mrp || !price || !category || !images.length) {
            return NextResponse.json({ error: "Provide all information" }, { status: 400 });
        }

        const imageUrls = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];

            if (!img) continue; // skip nulls

            // Convert to Buffer
            const buffer = Buffer.from(await img.arrayBuffer());

            // ✅ Force filename server-side
            const filename = `${name}-image-${i}-${Date.now()}.webp`;

            const response = await imagekit.upload({
                file: buffer,
                fileName: filename, // must always exist
                folder: "products",
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1024" }],
            });

            imageUrls.push(url);
        }

        if (!imageUrls.length) return NextResponse.json({ error: "No valid images" }, { status: 400 });

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imageUrls,
                storeId,
            },
        });

        return NextResponse.json({ message: "Product added successfully" }, { status: 201 });
    } catch (e) {
        console.error("Product upload error:", e);
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}

// Get all products for a seller
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({ error: "Not authorized store" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            where: { storeId },
        });

        return NextResponse.json({
            message: "Products fetched successfully",
            products, // ✅ return products
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}