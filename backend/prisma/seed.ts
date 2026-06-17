import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'The Legend of Zelda: Breath of the Wild', description: 'Open world adventure game', price: 59.99, image: 'http://localhost:3001/images/zelda.jpg', stock: 25, category: 'Adventure' },
  { name: 'Super Mario Odyssey', description: '3D platformer adventure', price: 49.99, image: 'http://localhost:3001/images/mario.jpg', stock: 30, category: 'Platformer' },
  { name: 'God of War', description: 'Action adventure game', price: 39.99, image: 'http://localhost:3001/images/godofwar.jpg', stock: 20, category: 'Action' },
  { name: 'Red Dead Redemption 2', description: 'Western action game', price: 59.99, image: 'http://localhost:3001/images/rdr2.jpg', stock: 15, category: 'Action' },
  { name: 'Cyberpunk 2077', description: 'Sci-fi RPG', price: 49.99, image: 'http://localhost:3001/images/cyberpunk.jpg', stock: 18, category: 'RPG' },
  { name: 'The Witcher 3: Wild Hunt', description: 'Open world RPG', price: 39.99, image: 'http://localhost:3001/images/witcher.jpg', stock: 22, category: 'RPG' },
  { name: 'Elden Ring', description: 'Action RPG', price: 59.99, image: 'http://localhost:3001/images/eldenring.jpg', stock: 28, category: 'RPG' },
  { name: 'Spider-Man', description: 'Superhero action game', price: 49.99, image: 'http://localhost:3001/images/spiderman.jpg', stock: 25, category: 'Action' },
  { name: 'Halo Infinite', description: 'FPS shooter', price: 59.99, image: 'http://localhost:3001/images/halo.jpg', stock: 20, category: 'Shooter' },
  { name: 'Call of Duty: Modern Warfare II', description: 'FPS shooter', price: 69.99, image: 'http://localhost:3001/images/cod.jpg', stock: 35, category: 'Shooter' },
  { name: 'Minecraft', description: 'Sandbox game', price: 29.99, image: 'http://localhost:3001/images/minecraft.jpg', stock: 50, category: 'Sandbox' },
  { name: 'Fortnite', description: 'Battle royale', price: 0, image: 'http://localhost:3001/images/fortnite.jpg', stock: 100, category: 'Battle Royale' },
  { name: 'FIFA 24', description: 'Soccer simulation', price: 69.99, image: 'http://localhost:3001/images/fifa.jpg', stock: 30, category: 'Sports' },
  { name: 'NBA 2K24', description: 'Basketball simulation', price: 69.99, image: 'http://localhost:3001/images/nba.jpg', stock: 25, category: 'Sports' },
  { name: 'Mortal Kombat 11', description: 'Fighting game', price: 39.99, image: 'http://localhost:3001/images/mk.jpg', stock: 20, category: 'Fighting' },
  { name: 'Street Fighter 6', description: 'Fighting game', price: 59.99, image: 'http://localhost:3001/images/streetfighter.jpg', stock: 22, category: 'Fighting' },
  { name: 'Super Smash Bros. Ultimate', description: 'Fighting game', price: 59.99, image: 'http://localhost:3001/images/smash.jpg', stock: 28, category: 'Fighting' },
  { name: 'Animal Crossing: New Horizons', description: 'Life simulation', price: 49.99, image: 'http://localhost:3001/images/animalcrossing.jpg', stock: 25, category: 'Simulation' },
  { name: 'Stardew Valley', description: 'Farming simulation', price: 14.99, image: 'http://localhost:3001/images/stardew.jpg', stock: 40, category: 'Simulation' },
  { name: 'Among Us', description: 'Party game', price: 4.99, image: 'http://localhost:3001/images/amongus.jpg', stock: 60, category: 'Party' },
  { name: 'Fall Guys', description: 'Party game', price: 19.99, image: 'http://localhost:3001/images/fallguys.jpg', stock: 35, category: 'Party' },
  { name: 'It Takes Two', description: 'Co-op adventure', price: 39.99, image: 'http://localhost:3001/images/ittakes2.jpg', stock: 20, category: 'Co-op' },
  { name: 'Overcooked 2', description: 'Co-op cooking game', price: 24.99, image: 'http://localhost:3001/images/overcooked.jpg', stock: 25, category: 'Co-op' },
  { name: 'GTA V', description: 'Open world action', price: 29.99, image: 'http://localhost:3001/images/gta5.jpg', stock: 30, category: 'Action' },
  { name: 'Resident Evil 4', description: 'Horror survival', price: 39.99, image: 'http://localhost:3001/images/re4.jpg', stock: 18, category: 'Horror' },
  { name: 'Silent Hill 2', description: 'Horror game', price: 49.99, image: 'http://localhost:3001/images/silenthill.jpg', stock: 15, category: 'Horror' },
  { name: 'Alien: Isolation', description: 'Horror survival', price: 19.99, image: 'http://localhost:3001/images/alien.jpg', stock: 20, category: 'Horror' },
  { name: 'Dark Souls III', description: 'Action RPG', price: 39.99, image: 'http://localhost:3001/images/darksouls3.jpg', stock: 22, category: 'RPG' },
  { name: 'Bloodborne', description: 'Action RPG', price: 39.99, image: 'http://localhost:3001/images/bloodborne.jpg', stock: 18, category: 'RPG' },
  { name: 'Sekiro', description: 'Action adventure', price: 59.99, image: 'http://localhost:3001/images/sekiro.jpg', stock: 20, category: 'Action' },
  { name: 'Hollow Knight', description: 'Metroidvania', price: 14.99, image: 'http://localhost:3001/images/hollowknight.jpg', stock: 35, category: 'Metroidvania' },
  { name: 'Hades', description: 'Roguelike action', price: 24.99, image: 'http://localhost:3001/images/hades.jpg', stock: 30, category: 'Roguelike' },
  { name: 'Slay the Spire', description: 'Card roguelike', price: 24.99, image: 'http://localhost:3001/images/slayspire.jpg', stock: 28, category: 'Card' },
  { name: 'Civilization VI', description: 'Strategy game', price: 59.99, image: 'http://localhost:3001/images/civ6.jpg', stock: 20, category: 'Strategy' },
  { name: 'Age of Empires II', description: 'RTS strategy', price: 39.99, image: 'http://localhost:3001/images/aoe2.jpg', stock: 25, category: 'Strategy' },
  { name: 'StarCraft II', description: 'RTS strategy', price: 0, image: 'http://localhost:3001/images/starcraft2.jpg', stock: 30, category: 'Strategy' },
  { name: 'XCOM 2', description: 'Turn-based strategy', price: 39.99, image: 'http://localhost:3001/images/xcom2.jpg', stock: 18, category: 'Strategy' },
  { name: 'Civilization V', description: 'Strategy game', price: 29.99, image: 'http://localhost:3001/images/civ5.jpg', stock: 22, category: 'Strategy' },
  { name: 'Forza Horizon 5', description: 'Racing game', price: 59.99, image: 'http://localhost:3001/images/forza.jpg', stock: 25, category: 'Racing' },
  { name: 'Need for Speed Heat', description: 'Racing game', price: 39.99, image: 'http://localhost:3001/images/nfsheat.jpg', stock: 20, category: 'Racing' },
  { name: 'Gran Turismo 7', description: 'Racing simulation', price: 69.99, image: 'http://localhost:3001/images/gt7.jpg', stock: 18, category: 'Racing' },
  { name: 'Mario Kart 8', description: 'Kart racing', price: 49.99, image: 'http://localhost:3001/images/mariokart.jpg', stock: 30, category: 'Racing' },
  { name: 'Rocket League', description: 'Vehicle soccer', price: 0, image: 'http://localhost:3001/images/rocketleague.jpg', stock: 50, category: 'Sports' },
  { name: 'Cuphead', description: 'Run and gun', price: 19.99, image: 'http://localhost:3001/images/cuphead.jpg', stock: 25, category: 'Action' },
  { name: 'Celeste', description: 'Platformer', price: 19.99, image: 'http://localhost:3001/images/celeste.jpg', stock: 28, category: 'Platformer' },
  { name: 'Ori and the Blind Forest', description: 'Platformer', price: 19.99, image: 'http://localhost:3001/images/ori.jpg', stock: 25, category: 'Platformer' },
  { name: 'Inside', description: 'Puzzle platformer', price: 19.99, image: 'http://localhost:3001/images/inside.jpg', stock: 22, category: 'Puzzle' },
  { name: 'Limbo', description: 'Puzzle platformer', price: 9.99, image: 'http://localhost:3001/images/limbo.jpg', stock: 30, category: 'Puzzle' },
  { name: 'Braid', description: 'Puzzle platformer', price: 9.99, image: 'http://localhost:3001/images/braid.jpg', stock: 25, category: 'Puzzle' },
  { name: 'Portal 2', description: 'Puzzle game', price: 19.99, image: 'http://localhost:3001/images/portal2.jpg', stock: 28, category: 'Puzzle' },
  { name: 'Half-Life 2', description: 'FPS', price: 9.99, image: 'http://localhost:3001/images/halflife2.jpg', stock: 35, category: 'Shooter' },
  { name: 'Left 4 Dead 2', description: 'Co-op shooter', price: 9.99, image: 'http://localhost:3001/images/l4d2.jpg', stock: 30, category: 'Shooter' }
];

async function main() {
  console.log('Starting seed...');

  await prisma.$transaction([
    prisma.cartItem.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.order.deleteMany(),
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
  ]);

  await prisma.user.createMany({
    data: [
      { email: 'admin@gamestore.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'user1@test.com', password: 'pass123', name: 'Test User 1', role: 'user' },
      { email: 'user2@test.com', password: 'pass123', name: 'Test User 2', role: 'user' },
      { email: 'user3@test.com', password: 'pass123', name: 'Test User 3', role: 'user' },
      { email: 'user4@test.com', password: 'pass123', name: 'Test User 4', role: 'user' }
    ]
  });

  await prisma.product.createMany({ data: products });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });