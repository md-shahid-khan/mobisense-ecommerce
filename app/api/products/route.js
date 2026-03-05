import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";


export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                inStock: true,
                store: {
                    isActive: true
                }
            },

            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                store: true
            },

            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({ products })

    } catch (err) {
        console.error(err)

        return NextResponse.json(
            {
                error: "Internal Server Error",
                message: err.message
            },
            { status: 500 }
        )
    }
}