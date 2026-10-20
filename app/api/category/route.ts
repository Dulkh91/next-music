import { prisma } from "@/lip/prisma";


export async function GET() {
    try {
        const categories = await prisma.songCategory.findMany({
            select:{id: true, name: true},
            orderBy: {name: 'desc'}
        })
        return Response.json(categories)
    } catch (error) {
        console.error("Failed to fetch Category:",error)
        return Response.json({error: "Failed to fech Category"})
    }
}