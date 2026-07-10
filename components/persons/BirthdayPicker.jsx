'use client';

import { CalendarIcon } from 'components/persons/PersonIcons';
import { toDate } from 'lib/gift-vault-utils';
import { useEffect, useMemo, useState } from 'react';
import Picker from 'react-mobile-picker';

const MONTHS = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1940;
const DEFAULT_PICKER_VALUE = { day: '01', month: '01', year: '2000' };

function padDay(day) {
    return String(day).padStart(2, '0');
}

function getDaysInMonth(month, year) {
    return new Date(Number(year), Number(month), 0).getDate();
}

function parseBirthdayValue(value) {
    if (!value) {
        return { ...DEFAULT_PICKER_VALUE };
    }

    const [year, month, day] = value.split('-');
    return {
        day: padDay(day || '01'),
        month: month || '01',
        year: year || '2000'
    };
}

function toBirthdayValue({ day, month, year }) {
    return `${year}-${month}-${day}`;
}

function clampPickerValue(value) {
    const maxDay = getDaysInMonth(value.month, value.year);
    const dayNumber = Math.min(Number(value.day), maxDay);

    return {
        ...value,
        day: padDay(dayNumber)
    };
}

function formatBirthdayLabel(value, displayFormat = 'long') {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    if (displayFormat === 'numeric') {
        return date.toLocaleDateString('en-GB');
    }

    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function buildDayOptions(month, year) {
    const totalDays = getDaysInMonth(month, year);
    return Array.from({ length: totalDays }, (_, index) => padDay(index + 1));
}

function buildYearOptions() {
    return Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, index) => String(CURRENT_YEAR - index));
}

const triggerClassName =
    'flex w-full items-center rounded-full border border-[#F0E8E5] bg-[#FAF8F7] py-3.5 pr-5 pl-11 text-left text-sm font-normal transition focus:border-rose-300 focus:bg-white focus:outline-none disabled:opacity-60';

export function BirthdayPicker({
    value,
    onChange,
    disabled = false,
    className = '',
    displayFormat = 'long',
    placeholder = 'Select date',
    dialogTitle = 'Select Birthday'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [draftValue, setDraftValue] = useState(() => parseBirthdayValue(value));
    const years = useMemo(() => buildYearOptions(), []);
    const days = useMemo(() => buildDayOptions(draftValue.month, draftValue.year), [draftValue.month, draftValue.year]);

    useEffect(() => {
        if (!isOpen) {
            setDraftValue(parseBirthdayValue(value));
        }
    }, [isOpen, value]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    function openPicker() {
        if (disabled) {
            return;
        }

        setDraftValue(parseBirthdayValue(value));
        setIsOpen(true);
    }

    function closePicker() {
        setIsOpen(false);
    }

    function handleDraftChange(nextValue) {
        setDraftValue(clampPickerValue(nextValue));
    }

    function handleConfirm() {
        onChange(toBirthdayValue(draftValue));
        closePicker();
    }

    const displayLabel = value ? formatBirthdayLabel(value, displayFormat) : placeholder;

    return (
        <>
            <div className={`relative ${className}`}>
                <span className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-neutral-400">
                    <CalendarIcon size={18} />
                </span>
                <button
                    type="button"
                    onClick={openPicker}
                    disabled={disabled}
                    className={`${triggerClassName} ${value ? 'text-neutral-900' : 'text-neutral-400'}`}
                >
                    {displayLabel}
                </button>
            </div>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <button
                        type="button"
                        aria-label="Close birthday picker"
                        className="absolute inset-0 bg-black/40"
                        onClick={closePicker}
                    />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={dialogTitle}
                        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white px-4 pt-3 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
                    >
                        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />

                        <div className="mb-2 flex items-center justify-between px-1">
                            <button
                                type="button"
                                onClick={closePicker}
                                className="rounded-lg px-2 py-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
                            >
                                Cancel
                            </button>
                            <p className="text-sm font-semibold text-neutral-800">{dialogTitle}</p>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="rounded-lg px-2 py-1 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f]"
                            >
                                Done
                            </button>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-[#FAF8F7]">
                            <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-10 -translate-y-1/2 rounded-xl border border-[#F0E8E5] bg-white/70" />
                            <Picker
                                value={draftValue}
                                onChange={handleDraftChange}
                                wheelMode="natural"
                                height={216}
                                itemHeight={36}
                                className="px-2"
                            >
                                <Picker.Column name="day">
                                    {days.map((day) => (
                                        <Picker.Item key={day} value={day}>
                                            {({ selected }) => (
                                                <div
                                                    className={`text-center text-sm transition ${
                                                        selected ? 'font-semibold text-[#D4625A]' : 'text-neutral-500'
                                                    }`}
                                                >
                                                    {day}
                                                </div>
                                            )}
                                        </Picker.Item>
                                    ))}
                                </Picker.Column>

                                <Picker.Column name="month">
                                    {MONTHS.map(({ value: monthValue, label }) => (
                                        <Picker.Item key={monthValue} value={monthValue}>
                                            {({ selected }) => (
                                                <div
                                                    className={`text-center text-sm transition ${
                                                        selected ? 'font-semibold text-[#D4625A]' : 'text-neutral-500'
                                                    }`}
                                                >
                                                    {label}
                                                </div>
                                            )}
                                        </Picker.Item>
                                    ))}
                                </Picker.Column>

                                <Picker.Column name="year">
                                    {years.map((year) => (
                                        <Picker.Item key={year} value={year}>
                                            {({ selected }) => (
                                                <div
                                                    className={`text-center text-sm transition ${
                                                        selected ? 'font-semibold text-[#D4625A]' : 'text-neutral-500'
                                                    }`}
                                                >
                                                    {year}
                                                </div>
                                            )}
                                        </Picker.Item>
                                    ))}
                                </Picker.Column>
                            </Picker>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
