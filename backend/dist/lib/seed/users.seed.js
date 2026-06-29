import { prisma } from "../prisma";
import { cryptUtils } from "../crypt";
const USER_FIXTURES = [
    {
        key: "admin",
        email: "admin@guiareal.com",
        username: "guitar_hero",
        password: "admin123",
        reputation_score: 100,
        is_banned: false,
        is_admin: true,
    },
    {
        key: "mod",
        email: "mod@guiareal.com",
        username: "mod_sensei",
        password: "mod123",
        reputation_score: 50,
        is_banned: false,
    },
    {
        key: "user",
        email: "user@guiareal.com",
        username: "shredder_99",
        password: "user123",
        reputation_score: 10,
        is_banned: false,
    },
    {
        key: "banned",
        email: "banned@guiareal.com",
        username: "spam_bot",
        password: "banned123",
        reputation_score: 0,
        is_banned: true,
    },
];
export async function seedUsers() {
    const result = {};
    for (const fixture of USER_FIXTURES) {
        const hashpassword = await cryptUtils.hashPassword(fixture.password);
        const user = await prisma.users.upsert({
            where: { email: fixture.email },
            update: {
                username: fixture.username,
                hashpassword,
                reputation_score: fixture.reputation_score,
                is_banned: fixture.is_banned,
                is_admin: "is_admin" in fixture ? fixture.is_admin : false,
            },
            create: {
                email: fixture.email,
                username: fixture.username,
                hashpassword,
                reputation_score: fixture.reputation_score,
                is_banned: fixture.is_banned,
                is_admin: "is_admin" in fixture ? fixture.is_admin : false,
            },
        });
        result[fixture.key] = { id: user.id };
    }
    return result;
}
export function logUserCredentials() {
    console.log("\nCredenciais de teste:");
    for (const fixture of USER_FIXTURES) {
        console.log(`  ${fixture.email} / ${fixture.username} — senha: ${fixture.password}`);
    }
}
