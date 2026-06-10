import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Services() {
  return (
    <section className="py-16 sm:py-24 lg:py-section-gap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface uppercase tracking-wide mb-2 sm:mb-3">
            Technical Services
          </h2>
          <p className="font-body-md text-base text-on-surface-variant">
            Engineered routines for the modern professional.
          </p>
        </div>
        <Link
          href="#"
          className="font-label-sm text-sm text-primary uppercase tracking-widest hover:text-primary-container transition-colors flex items-center group w-fit"
        >
          Full Menu
          <span
            className="material-symbols-outlined ml-1.5 group-hover:translate-x-1 transition-transform"
            style={{ fontSize: "18px" }}
          >
            arrow_forward
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Signature Cut (Large Span) */}
        <div className="md:col-span-2 lg:col-span-8 bg-surface-container-highest border border-outline-variant p-6 sm:p-8 rounded-sm group hover:border-primary transition-colors flex flex-col justify-between min-h-[320px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-container-low opacity-50 z-0"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-surface p-3 rounded-sm border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                content_cut
              </span>
            </div>
            <span className="font-label-sm text-xs text-secondary uppercase tracking-widest border border-outline-variant px-2.5 py-1.5 rounded-sm">
              45 Min
            </span>
          </div>
          <div className="relative z-10 mt-12 sm:mt-16">
            <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface mb-3">
              The Signature Architecture
            </h3>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mb-8 max-w-md">
              A structural haircut utilizing geometric precision to map your bone
              structure. Includes consultation, precision wash, and structural
              styling.
            </p>
            <div className="flex items-center justify-between border-t border-outline-variant pt-5">
              <span className="font-headline-md text-2xl sm:text-3xl text-primary">
                $65
              </span>
              <Button variant="outline" size="sm" className="border-transparent">
                Book
              </Button>
            </div>
          </div>
        </div>

        {/* Beard Grooming (Medium Span) */}
        <div className="md:col-span-1 lg:col-span-4 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-sm group hover:border-primary transition-colors flex flex-col justify-between min-h-[320px]">
          <div className="flex justify-between items-start">
            <div className="bg-surface p-3 rounded-sm border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                face
              </span>
            </div>
            <span className="font-label-sm text-xs text-secondary uppercase tracking-widest border border-outline-variant px-2.5 py-1.5 rounded-sm">
              30 Min
            </span>
          </div>
          <div className="mt-8 sm:mt-12">
            <h3 className="font-headline-md text-lg sm:text-xl text-on-surface mb-3">
              Beard Calibration
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-8">
              Lineup and sculpting using hot lather and straight razor precision.
            </p>
            <div className="flex items-center justify-between border-t border-outline-variant pt-5">
              <span className="font-headline-md text-xl sm:text-2xl text-primary">
                $40
              </span>
              <Button variant="outline" size="sm" className="border-transparent">
                Book
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Reset */}
        <div className="md:col-span-1 lg:col-span-4 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-sm group hover:border-primary transition-colors flex flex-col justify-between min-h-[240px]">
          <div className="flex justify-between items-start mb-5">
            <h3 className="font-headline-md text-lg sm:text-xl text-on-surface">
              The Reset (Buzz)
            </h3>
            <span className="font-headline-md text-lg sm:text-xl text-primary">
              $35
            </span>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mb-8 flex-grow">
            Uniform clipper work. Fast, efficient, flawless.
          </p>
          <Button variant="outline" size="full" className="py-3.5">
            Book Session
          </Button>
        </div>

        {/* Scalp Treatment */}
        <div className="md:col-span-2 lg:col-span-8 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-sm group hover:border-primary transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 min-h-[240px]">
          <div className="flex-grow">
            <div className="flex items-center space-x-3 mb-3">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                water_drop
              </span>
              <h3 className="font-headline-md text-lg sm:text-xl text-on-surface">
                Follicle Therapy
              </h3>
            </div>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-lg">
              Deep cleansing and invigoration using cooling menthol and
              high-frequency stimulation devices.
            </p>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-outline-variant pt-5 sm:pt-0 sm:pl-8">
            <div className="flex flex-col sm:items-end gap-2">
              <span className="font-headline-md text-xl sm:text-2xl text-primary">
                $55
              </span>
              <span className="font-label-sm text-xs text-secondary uppercase tracking-widest border border-outline-variant px-2.5 py-1 rounded-sm">
                20 Min
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-transparent">
              Book
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
