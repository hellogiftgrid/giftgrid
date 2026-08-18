"use client";

import React from "react";

const categories = [
  { title: "Corporate Gifting", image: "/images/coporate gifting.png" },
  { title: "Bulk Buyers", image: "/images/bulk buyers.png" },
  { title: "Wholesale", image: "/images/whosale.png" },
  { title: "Retail", image: "/images/retail.png" },
  { title: "Corporate Procurement", image: "/images/coporate procurement.png" },
  { title: "Distributors", image: "/images/distributors.png" },
  { title: "Employee Reward Platforms", image: "/images/employee reward platform.png" },
  { title: "Hospitality", image: "/images/hospittality.png" },
  { title: "Events", image: "/images/events.png" },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-12 text-center">
          Our Opportunity Network
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="relative rounded-xl overflow-hidden shadow-lg h-64 bg-gray-100 group transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
