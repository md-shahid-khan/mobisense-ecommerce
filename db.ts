import 'dotenv/config'

import { PrismaNeon } from '@prisma/adapter-neon'
import {PrismaClient} from "@prisma/client/extension";

const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
})

export let prisma = new PrismaClient({ adapter })