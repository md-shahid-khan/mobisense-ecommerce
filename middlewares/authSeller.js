

import { prisma } from "@/lib/prisma";

const authSeller = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true },
        });

        if (!user || !user.store) {
            return false;
        }

        if (user.store.status === "approved") {
            return user.store.id; // return store id
        }

        return false;

    } catch (err) {
        console.error(err);
        return false;
    }
};

export default authSeller;