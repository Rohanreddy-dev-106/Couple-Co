import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function TshirtCard({ id, image, name, price, size, stock }) {
  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="bg-[#fbfbf6] rounded-3xl p-4 sm:p-6 transition-all duration-300 group-hover:-translate-y-2 border-2 border-gray-100 group-hover:border-black group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {/* Image Container (Simulating the white card from mockups) */}
        <div className="bg-white rounded-2xl h-64 sm:h-72 w-full flex items-center justify-center mb-6 overflow-hidden border-2 border-gray-100 group-hover:border-gray-200 transition-colors">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Footer */}
        <div className="flex flex-col gap-3 px-1 mt-2">
          {/* Top row: Name & Price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-black leading-tight mb-1 truncate whitespace-normal line-clamp-2">
                {name}
              </h3>
              {size && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {size}
                </p>
              )}
            </div>
            <p className="text-lg sm:text-xl font-black text-black leading-none shrink-0 pt-0.5">
              ₹{price}
            </p>
          </div>

          {/* Bottom row: Stock Indicator */}
          <div className="w-full py-3 mt-1 bg-[#cfff04] text-black text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl text-center border-2 border-transparent group-hover:border-[#b0e600] transition-colors">
            In Stock: {stock !== undefined ? stock : 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
