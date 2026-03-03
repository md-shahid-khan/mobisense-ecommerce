import {getAuth} from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import {NextResponse} from "next/server";

// is admin api
export async function GET(req, res) {
    try {
        const {userId} = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({error: "Authentication Error"}, {status: 401});
        }
        return NextResponse.json({isAdmin});

    } catch (err) {
        return NextResponse.json({error: err.message || err.code});
    }
}