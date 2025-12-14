import prisma from "./prisma/prisma-client.js";
// Example
async function main() {
  const user = await prisma.users.findFirst();
  console.log(user);
}

main();
