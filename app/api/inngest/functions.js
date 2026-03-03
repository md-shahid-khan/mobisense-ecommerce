import { inngest } from "@/inngest/client"
import { prisma } from "../../../lib/prisma"

export const syncUserCreation = inngest.createFunction(
    { id: "user-create" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const data = event.data

        await prisma.user.create({
            data: {
                id: data.id,
                email: data.email_addresses?.[0]?.email_address ?? "",
                name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
                image: data.image_url,
            },
        })
    }
)

export const syncUserUpdation = inngest.createFunction(
    { id: "user-updation" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const data = event.data

        await prisma.user.update({
            where: { id: data.id },
            data: {
                email: data.email_addresses?.[0]?.email_address ?? "",
                name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
                image: data.image_url,
            },
        })
    }
)

export const syncUserDelete = inngest.createFunction(
    { id: "user-delete" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const data = event.data

        await prisma.user.delete({
            where: { id: data.id },
        })
    }
)