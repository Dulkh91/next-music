import { prisma } from "@/lip/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            select: {id: true, name: true},
            orderBy: {name: 'asc'},
        });
        return Response.json(products)
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return Response.json({ error: "Failed to fetch product" }, { status: 500 });
    }
    
}