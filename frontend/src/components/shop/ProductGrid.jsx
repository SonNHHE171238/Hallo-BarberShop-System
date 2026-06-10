import React from "react";

const mockProducts = [
  {
    id: 1,
    brand: "HALLO",
    name: "Matte Clay Pomade",
    price: "600k",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdSSBn04JXKDHVOOk7fgC9dvPyUGIna6clqqTxU-hKlNJ0EwYy95IS6pGQ-n8FD8aXLinpDqWliR2c2uZjsUn9AfvzBZ8cCTa1YDl9n06TpLyNU5eUh3r7cmhRvJMSFYj1VrCkXQs8ENTxvHSLHe5j1KRF8jNXXYxczRuM21SUueT6ZB68mb4dnumejh23Qrsv9hWY19u2k28uyPRHLVmJK3gSXkRkW7eyQ7HkzbDzMY4aAEEg0ovZ9zpnJFMTSrVWCHj8393mW1xf",
    isBestSeller: true,
  },
  {
    id: 2,
    brand: "Obsidian",
    name: "Architect Beard Oil",
    price: "800k",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDis6jJDZF5SjnLE__oQaK5kQtq3SzaLcrwDOc61Ur_8fspgUXvbl20AJs5X7FHL-b7lAH5wr0xKk72QwmUTU2zimei1eXDX4np2HKuosYVdh2aLVrsxSX40SCqUoLWnUmUeIMkRQXUgtyd9ULDspcy_xAHp5JVeU8SK7ByTkM8EA9Ejh-iTS_uVfds8IuUlu6_6dzuZI7AC6RGI-rVIroyut0HLlJaR4V-y-8j9Am9e6HCbHjus6YLR6eHu3mfTqDwgM8ayG0kyBWJ",
    isBestSeller: false,
  },
  {
    id: 3,
    brand: "Apex",
    name: "Precision Razor",
    price: "1.150k",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHAeDNacpY4Rm97XgKXsu0gkroEds8rmvgbUHaue_SJLi7MHsxdmuLJviiF5bq6Le4AA1qcDiUePyo24IFgIMEayl_XiwCfaaGE6XTytQdU8XWQgEzBcHZc8nu3AaJIVI8u-snq4tx6thO1ViB0-HXNTz7A3PrM5AHjBslUducfYMCbmUc0jgFlyCPxq2qoetJdE5zgQsdsOwmmylcpkZyp8KSHiGDSZtiESOwqdmektVKy-DHC7V7wqarYYFurc4Tzaef3Y13nXsb",
    isBestSeller: false,
  },
  {
    id: 4,
    brand: "HALLO",
    name: "Charcoal Face Wash",
    price: "700k",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIIMKpNCnhAHvabpdU9ngptU5L1DHCQ50CGAtjCiTm_OFWMazP95q89KUOtpt9xUSMw5P0FvnWhBkoNuH14xSSkEi_leU8fbPg1KdHhuDgKHWF-xqTDoaHhk6z9Owu2qIWufSXmhCpDMDbTDl5CG4uiLGOVP3GceUuH15JQl1nUNC_zSFMTySAsOofLLCWJqE42baRLt2dh0geX4Sg3mnm-KFOe4zga8sqk7JyTViE_5pW1Ya-2cLKbq6CvSzMb3byBeR_jI5PpbHI",
    isBestSeller: false,
  }
];

export default function ProductGrid() {
  return (
    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
      {mockProducts.map((product) => (
        <div key={product.id} className="group flex flex-col bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant transition-all duration-500">
          <div className="relative aspect-[4/5] overflow-hidden bg-background flex items-center justify-center p-6">
            <img 
              alt={product.name} 
              className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
              src={product.image} 
            />
            {product.isBestSeller && (
              <span className="absolute top-0 right-0 bg-primary text-on-primary font-label-md text-[10px] px-3 py-1 uppercase tracking-[0.2em]">
                Bán Chạy
              </span>
            )}
          </div>
          <div className="p-8 flex flex-col flex-grow">
            <span className="font-label-md text-[12px] text-primary uppercase tracking-[0.3em] mb-3">{product.brand}</span>
            <h4 className="font-headline-sm text-headline-sm mb-3 text-white group-hover:text-primary transition-colors">{product.name}</h4>
            <p className="font-label-md text-headline-sm text-on-surface-variant mb-8">{product.price}</p>
            <button className="mt-auto w-full bg-transparent border border-outline-variant text-primary font-label-md text-label-md py-4 uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300">
              Thêm Vào Giỏ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
