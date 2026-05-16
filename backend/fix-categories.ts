import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mockCategoryNames: Record<string, string> = {
    '1': 'Kertas & Kardus',
    '2': 'Plastik (Botol, Gelas)',
    '3': 'Besi & Logam',
    '4': 'Elektronik (E-Waste)'
  };

  for (const [id, name] of Object.entries(mockCategoryNames)) {
    const exists = await prisma.wasteCategory.findUnique({ where: { id } });
    if (exists && exists.name.startsWith('Kategori ')) {
      await prisma.wasteCategory.update({
        where: { id },
        data: { name }
      });
      console.log(`Updated category ${id} to ${name}`);
    } else if (!exists) {
      await prisma.wasteCategory.create({
        data: {
          id,
          name,
          description: 'Kategori otomatis (dari script)'
        }
      });
      console.log(`Created category ${id} as ${name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
