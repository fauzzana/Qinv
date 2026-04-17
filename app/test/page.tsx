// app/products/page.tsx
import { PrismaClient } from '@prisma/client'
import Image from 'next/image'

const prisma = new PrismaClient()

export default async function ProductPage() {
  // Mengambil semua data produk dari database
  const products = await prisma.item.findMany()

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.item_id} className="border p-4">
          <h2>{product.name}</h2>
          {/* Menampilkan gambar menggunakan komponen Next.js Image */}
          <div className="relative h-48 w-full">
            <Image
              src={product.image || '/placeholder.png'} // Gunakan gambar placeholder jika tidak ada
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
