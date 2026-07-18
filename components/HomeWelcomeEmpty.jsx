'use client';

import { CakeIcon, HeartIcon, NotesTabIcon, PersonIcon } from 'components/persons/PersonIcons';
import Image from 'next/image';
import Link from 'next/link';
import WelcomeImage from 'public/images/assets/gift-ill.png';

const STEPS = [
    {
        title: 'Save people you care about',
        description: 'Add friends and family with birthdays and a quick profile.',
        Icon: PersonIcon
    },
    {
        title: 'Capture notes & wishlists',
        description: 'Jot preferences, gift ideas, and things they love.',
        Icon: NotesTabIcon
    },
    {
        title: 'Never miss a moment',
        description: 'Get reminders for birthdays and special dates.',
        Icon: CakeIcon
    }
];

export function HomeWelcomeEmpty() {
    return (
        <section className="flex w-full flex-col gap-6 animate-fade-in">
            <div className="overflow-hidden rounded-3xl bg-white px-6 pt-8 pb-7 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <Image
                    src={WelcomeImage}
                    alt=""
                    className="mx-auto h-36 w-auto object-contain"
                    aria-hidden="true"
                    priority
                />
                <h2 className="mt-5 text-xl font-bold text-neutral-900">Welcome to Memnto</h2>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-neutral-500">
                    Keep the people you love, their notes, and gift ideas in one calm place.
                </p>
                <Link
                    href="/persons/new"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
                >
                    <span className="text-lg leading-none">+</span>
                    Add your first person
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="px-1 text-sm font-semibold text-neutral-800">How it works</h3>
                <ul className="flex flex-col gap-2">
                    {STEPS.map((step, index) => {
                        const Icon = step.Icon;
                        return (
                            <li
                                key={step.title}
                                className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEA] text-[#D4625A]">
                                    <Icon size={18} />
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <p className="text-2xs font-semibold tracking-wide text-[#D4625A] uppercase">
                                        Step {index + 1}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-neutral-800">{step.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="rounded-3xl border border-dashed border-[#E8D9D2] bg-white/70 px-5 py-5">
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF5E5] text-amber-500">
                        <HeartIcon size={16} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-neutral-800">Start small</p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                            Add one person you buy gifts for. You can attach notes, a wishlist, reminders, and family
                            connections later.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
