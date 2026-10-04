import Image from 'next/image';

export function InteriorHero({ eyebrow, title, description, image }: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden bg-[var(--brand-ink)] text-white sm:min-h-[500px]">
      <Image src={image} alt="" fill priority quality={60} sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#211910]/85 via-[#211910]/45 to-[#211910]/15" />
      <div className="relative mx-auto w-full max-w-[1320px] px-6 pb-16 pt-28 sm:px-10 sm:pb-20 lg:px-16">
        <p className="eyebrow text-[#e6c89b]">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl font-heading text-[clamp(2.5rem,6vw,6.5rem)] leading-[1.08] tracking-[-0.045em]">{title}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-white/85 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
