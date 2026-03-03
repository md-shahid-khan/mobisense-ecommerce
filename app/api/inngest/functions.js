import {inngest} from "@/inngest/client";
import {prisma} from "db"


//inngest function to save user data to the postgresql

export const synUserCreation = inngest.createFunction(
    {
        id: "user-create",
    },
    {event: "clerk/user.created"},
    async ({event}) => {
        const data = event;
        await prisma.user.create({
            data: {
                id: data.id,
                email: data.email_address[0],
                name: `${data.first_name} ${data.last_name}`,
                image: data.image_url,
            }
        })
    }
)

export const syncUserUpdation = inngest.createFunction(
    {id: "user-updation"},
    {event: "clerk/user.updated"},
    async ({event}) => {
        const data = event;
        await prisma.user.update({
            where: {id: data.id},
            data: {

                email: data.email_address[0],
                name: `${data.first_name} ${data.last_name}`,
                image: data.image_url,
            }

        })
    }
)

//inngest function to delete user
export const syncUserDelete = inngest.createFunction(
    {id: "user-delete"},
    {event: "clerk/user.deleted"},
    async ({event}) => {
        const data = event;
        await prisma.user.delete({
            where: {id: data.id},
        })
    }
)