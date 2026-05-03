import { prisma } from './lib/prisma'

async function main() {
  console.log('criando produto')

  const result = await prisma.products.create({
    data: {
      name: 'Product test',
      ean: '12456485'
    }
  })

  console.log(result)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
