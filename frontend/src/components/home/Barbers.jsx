import React from "react";

export default function Barbers() {
  return (
    <section id="team" className="py-24 bg-surface max-w-[1200px] mx-auto px-4 md:px-16">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-16 text-center">Đội ngũ của chúng tôi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant">
          <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" alt="Hùng Trần" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD98r2pOKhuYXzv3cl1QT4ROAvIMz3LF6FkIfI3d2PPvF-xxha0le3eUgaJLO4AOJrg6G8k584XRr7ujf6gWCayquTKTFxmvisfOpk8DMKrPGHI9Kjomn1zf2KO22U-84tLzGXILN22XMFt35hpstjzPLSnMpVKkOtyQDUT-ai80BGoNOYud9RW9lL8P1JgJG111HiVYyAteBX6wMGXb337LszfxjjOVGkNvJd6fhW-RnjoieKm9rGjdHeknaP7G-5HMYho445oaCqs" />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-primary font-label-md text-label-md uppercase mb-1">Master Barber</p>
            <h3 className="text-on-surface font-headline-md text-headline-md">Hùng Trần</h3>
          </div>
        </div>
        <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant">
          <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" alt="Minh Hoàng" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhXch6eKHhEdXNyDYihVJ0avVzpmImFu1E1fZdvIJRpVUl8E26frL9YsDE5BRV6zPRKnnP2jF7MWLriGsvn5RLptzWgNKd9hNOkKS75PLTMzy2kJA_r83_3Pvfm2Qm1-nVIKvVcLEhRQCXk7X7INLuSjy60U-8G52Q8OxX4ceKxp6QHsafhwljE6A-S6_1myb8OraB-GD88lykFVIyqlWVN4yVvETsrNNbkLVT0Pkv8vsX5nfpeN7sWrpmkd6hLmQnGTe2B5D-46SE" />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-primary font-label-md text-label-md uppercase mb-1">Top Stylist</p>
            <h3 className="text-on-surface font-headline-md text-headline-md">Minh Hoàng</h3>
          </div>
        </div>
        <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant">
          <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" alt="Dũng Nguyễn" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjRzqJ9AMRgoxqqKcIcP-jtbSPhA8sqCWb19OBmwB7ikFpazYTEf43cNf7RbPCxC3CWYfMUB3L9pJq6GCOGhtcKkoI5iJbQbOvOXmQ4wBh1VZ_qTtoEYpSAJB9AGDaiFzGNwwRIp5mKtjx3084WhjdrL3c7H6IwHRCkHlAclWgkucTQfO1_Weq1EKpdAkS3Uf8MclxIJBg_OGQ5f7DfomS7eFZuXikZQgVLFOvxyBtTWDcbPnBDkkxtrXYA9CLmG5M0k0MbVqL85BK" />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-primary font-label-md text-label-md uppercase mb-1">Senior Barber</p>
            <h3 className="text-on-surface font-headline-md text-headline-md">Dũng Nguyễn</h3>
          </div>
        </div>
        <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-outline-variant">
          <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" alt="Quốc Anh" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHCNIU_NtEAhYL2toMEkwxZcAELnPGZ53YjY0Psy7Nu4tcmHH39blpQKj3AJFewFuFo5-uLglKeYWE-fww2pbaT9sRt4SqX2rl-VQN4C0QK7_Q9OVsuOo65LWgL8H59u9cDDNtAhJNhJWvHNvs4w-2bLQK-nipAWyHbAetQEygOrG7pAybW72Ze3jSg2N0eCi9wYDdY-jJp1ZtlqTyaXpo5auKKfEBG8P2Ej6L7sS3AnOVU9AqAZhYLjt4ociRrYhsiI2TgSUMF_UT" />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-primary font-label-md text-label-md uppercase mb-1">Junior Stylist</p>
            <h3 className="text-on-surface font-headline-md text-headline-md">Quốc Anh</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
