import React from "react";

export default function BlogHero() {
  return (
    <section className="relative min-h-[512px] flex items-center overflow-hidden px-margin-mobile md:px-margin-desktop py-section-padding">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      </div>
      <div className="relative z-10 max-w-container-max mx-auto w-full">
        <div className="max-w-2xl">
          <span className="text-primary font-label-md text-label-md uppercase tracking-[0.2em] mb-4 block">
            Di Sản & Phong Cách
          </span>
          <h1 className="text-white font-headline-lg-mobile md:text-display-lg md:font-display-lg leading-none mb-6">
            Góc Di Sản & <br />
            <span className="text-primary italic font-serif-display font-light">
              Phong Cách
            </span>
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg mb-8 max-w-lg">
            Khám phá nghệ thuật chăm sóc nam giới, từ những kỹ thuật cắt kéo
            truyền thống đến những xu hướng hiện đại định hình quý ông thế kỷ 21.
          </p>
        </div>
      </div>
    </section>
  );
}
