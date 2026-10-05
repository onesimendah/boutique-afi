import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Riz parfumé 5 kg", category: "Épicerie", price: 4500, stock: 30, description: "Riz long grain, sac de 5 kg." },
  { name: "Huile d'arachide 1 L", category: "Épicerie", price: 1500, stock: 40, description: "Huile pressée localement." },
  { name: "Gari blanc 2 kg", category: "Épicerie", price: 1200, stock: 25, description: "Gari fin de Savalou." },
  { name: "Haricot niébé 1 kg", category: "Épicerie", price: 900, stock: 35, description: "Haricot blanc trié." },
  { name: "Tomate concentrée", category: "Épicerie", price: 350, stock: 80, description: "Boîte de 400 g." },
  { name: "Sucre en morceaux", category: "Épicerie", price: 800, stock: 50, description: "Boîte de 1 kg." },
  { name: "Lait en poudre 400 g", category: "Petit-déjeuner", price: 2800, stock: 20, description: "Lait entier en sachet." },
  { name: "Café moulu 250 g", category: "Petit-déjeuner", price: 1800, stock: 15, description: "Café robusta torréfié." },
  { name: "Pain de mie", category: "Petit-déjeuner", price: 700, stock: 12, description: "Livré chaque matin." },
  { name: "Savon de ménage", category: "Entretien", price: 300, stock: 60, description: "Pain de savon 200 g." },
  { name: "Eau de javel 1 L", category: "Entretien", price: 600, stock: 3, description: "Flacon de 1 litre." },
  { name: "Eau minérale 1,5 L", category: "Boissons", price: 400, stock: 0, description: "Bouteille de 1,5 litre." },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
  console.log(`${products.length} produits ajoutés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
