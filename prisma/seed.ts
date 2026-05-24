import {prisma} from "@/lib/prisma"

async function main() {
    console.log("seeding database")

    await prisma.reservation.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.warehouse.deleteMany()

    const hyderabadWarehouse = await prisma.warehouse.create({
        data:{
            name:"hyderabad Warehouse",
            location:"Hyderabad"
        }
    });

    const chennaiWarehouse = await prisma.warehouse.create({
        data:{
            name:"chennai Warehouse",
            location:"Chennai"
        }
    });

    const iphone = await prisma.product.create({
        data:{
            name:"iphone 17",
            sku:"IPHONE-17"
        }
    })
    const airpods = await prisma.product.create({
        data:{
            name:"AirPods Pro",
            sku:"AIRPODS-PRO"
        }
    })

    await prisma.inventory.createMany({
        data:[
            {
                productId:iphone.id,
                warehouseId:hyderabadWarehouse.id,
                totalQuantity:100,
            },
            {
                productId:iphone.id,
                warehouseId:chennaiWarehouse.id,
                totalQuantity:50,
            },
            {
                productId:airpods.id,
                warehouseId:hyderabadWarehouse.id,
                totalQuantity:40,
            },
            {
                productId:airpods.id,
                warehouseId:chennaiWarehouse.id,
                totalQuantity:30,
            },
        ]
    })

    console.log("Database seeded successfully")
}

main()
    .catch((e)=>{
        console.error(e);
        process.exit(1)
    })
    .finally(async()=>{
        await prisma.$disconnect();
    })
