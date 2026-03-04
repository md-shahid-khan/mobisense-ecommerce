import {prisma} from "@/lib/prisma";

const authSeller = async (userId) => {
    if (!userId) return false; //  prevent crash

    try {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {store: true},
        });

        if (!user || !user.store) return false;

        if (user.store.status.toLowerCase() === "approved") {
            return user.store.id;
        }

        return false;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export default authSeller;