import Image from "next/image"
import Link from "next/link"

interface GameCardProps {
  title: string
  bgColor: string
  image: string
  href: string
}

export default function GameCard({ title, bgColor, image, href }: GameCardProps) {
  return (
    <Link href={href} className="block">
      <div className={`rounded-lg overflow-hidden aspect-square relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:neon-border`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={image}
            alt={title}
            width={200}
            height={200}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <h3 className="text-xl font-bold text-white text-center group-hover:gradient-text transition-all duration-300">{title}</h3>
          <p className="text-white/80 text-center text-sm">Play Now</p>
        </div>
      </div>
    </Link>
  )
}

