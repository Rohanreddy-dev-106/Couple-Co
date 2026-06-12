import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TshirtCard({ id, image, name, price, size }) {
  return (
    <Link to={`/product/${id}`} className="block">
      <Card className='group premium-card'>
        {/* Image */}
        <div className='relative h-64 overflow-hidden bg-gray-100'>
          <img
            src={image}
            alt={name}
            className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
          />

          {/* Top badges */}
          <Badge className='absolute left-3 top-3 bg-black/80 backdrop-blur-sm text-white border-0'>New</Badge>

          <span className='absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-indigo-900 shadow-sm'>
            ₹{price}
          </span>
        </div>

        {/* Content */}
        <CardContent className='space-y-1.5 p-5 text-center'>
          <h3 className='truncate text-lg font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors'>
            {name}
          </h3>

          <p className='text-sm text-gray-500 font-medium'>{size || "Premium Cotton"}</p>

          <p className='text-xl font-black text-gray-900 pt-1'>₹{price}</p>
        </CardContent>

        {/* Hover overlay */}
        <div className='pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent transition duration-300 group-hover:ring-indigo-500/20' />
      </Card>
    </Link>
  );
}
