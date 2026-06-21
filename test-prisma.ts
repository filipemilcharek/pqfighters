import { PrismaClient } from "./src/generated/prisma/client";

async function main() {
  const dbUrl = "file:/Users/adm/Documents/programming_projects/gfc-development/faixappreta/prisma/tenants/gustavao-lutinhas.db";
  
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const client = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbUrl })
  });
  
  console.log("Checking user...");
  console.log(await client.user.findFirst());
  console.log("Checking VerificationToken...");
  console.log(await client.verificationToken.findFirst());
}
main().catch(console.error);
