'use client';

import { AddConnectionModal } from 'components/persons/AddConnectionModal';
import { FriendsIcon, HomeIcon, PersonIcon, PlusIcon } from 'components/persons/PersonIcons';
import { ConfirmDialog } from 'components/ConfirmDialog';
import {
    getConnectionLabel,
    groupFamilyConnectionsByLabel,
    splitConnectionsByGroup
} from 'lib/connection-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function RemoveButton({ name, onClick }) {
    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClick?.();
            }}
            aria-label={`Remove ${name}`}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#F0E8E5] bg-white text-neutral-400 shadow-sm transition hover:border-[#D4625A] hover:text-[#D4625A]"
        >
            <svg viewBox="0 0 12 12" width="8" height="8" aria-hidden="true">
                <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        </button>
    );
}

function Avatar({ person, size = 'md', ring = false }) {
    const sizeClass =
        size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-10 w-10' : size === 'xs' ? 'h-9 w-9' : 'h-12 w-12';
    const iconSize = size === 'lg' ? 22 : size === 'sm' || size === 'xs' ? 16 : 18;
    const ringClass = ring ? 'ring-2 ring-[#D4625A]' : '';

    if (person?.avatarURL) {
        return (
            <img
                src={person.avatarURL}
                alt={person.name}
                className={`${sizeClass} rounded-full object-cover ${ringClass}`}
            />
        );
    }

    return (
        <div
            className={`flex ${sizeClass} items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400 ${ringClass}`}
        >
            <PersonIcon size={iconSize} />
        </div>
    );
}

function RelationChip({ label, accent = false }) {
    return (
        <span
            className={`mt-1 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-3xs font-semibold ${
                accent ? 'bg-[#FDEBEA] text-[#D4625A]' : 'bg-[#FAF8F7] text-neutral-500'
            }`}
        >
            {label}
        </span>
    );
}

function TreePersonNode({ person, label, isCenter = false, onRemove }) {
    const body = (
        <div className="relative flex w-20 min-w-0 flex-col items-center">
            <div className="relative">
                <Avatar person={person} size="md" ring={isCenter} />
                {!isCenter && onRemove ? <RemoveButton name={person?.name} onClick={onRemove} /> : null}
            </div>
            <p
                className={`mt-2 w-full truncate text-center text-xs font-semibold ${
                    isCenter ? 'text-[#D4625A]' : 'text-neutral-800'
                }`}
            >
                {person?.name || 'Unknown'}
            </p>
            <RelationChip
                label={label ? getConnectionLabel(label) : 'Viewing'}
                accent={isCenter || Boolean(label)}
            />
        </div>
    );

    if (isCenter || !person?.id) {
        return body;
    }

    return (
        <Link href={`/persons/${person.id}`} className="no-underline transition hover:opacity-80">
            {body}
        </Link>
    );
}

function TreeRail({ children }) {
    return (
        <div className="relative flex flex-wrap items-start justify-center gap-x-5 gap-y-4">
            {children}
        </div>
    );
}

function VerticalStem() {
    return (
        <div className="flex flex-col items-center py-1" aria-hidden="true">
            <div className="h-3 w-px bg-[#E8D9D2]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#E8D9D2]" />
            <div className="h-3 w-px bg-[#E8D9D2]" />
        </div>
    );
}

function FamilyTreeVisualization({ person, connections, personById, onRemoveConnection }) {
    const groups = groupFamilyConnectionsByLabel(connections);

    const parents = groups.parent
        .map((connection) => ({ connection, person: personById.get(connection.linkedPersonId) }))
        .filter((item) => item.person);
    const children = groups.child
        .map((connection) => ({ connection, person: personById.get(connection.linkedPersonId) }))
        .filter((item) => item.person);
    const partners = groups.spouse
        .map((connection) => ({ connection, person: personById.get(connection.linkedPersonId) }))
        .filter((item) => item.person);
    const siblings = groups.sibling
        .map((connection) => ({ connection, person: personById.get(connection.linkedPersonId) }))
        .filter((item) => item.person);
    const inLaws = groups.in_law
        .map((connection) => ({ connection, person: personById.get(connection.linkedPersonId) }))
        .filter((item) => item.person);

    return (
        <div className="overflow-hidden rounded-3xl border border-[#F0E8E5] bg-linear-to-b from-white to-[#FFFCFB] px-3 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            {parents.length ? (
                <>
                    <TreeRail>
                        {parents.map(({ connection, person: linkedPerson }) => (
                            <TreePersonNode
                                key={connection.id}
                                person={linkedPerson}
                                label={connection.label}
                                onRemove={() => onRemoveConnection(connection)}
                            />
                        ))}
                    </TreeRail>
                    <VerticalStem />
                </>
            ) : null}

            <TreeRail>
                {siblings.map(({ connection, person: linkedPerson }) => (
                    <TreePersonNode
                        key={connection.id}
                        person={linkedPerson}
                        label={connection.label}
                        onRemove={() => onRemoveConnection(connection)}
                    />
                ))}
                <TreePersonNode person={person} isCenter />
                {partners.map(({ connection, person: linkedPerson }) => (
                    <TreePersonNode
                        key={connection.id}
                        person={linkedPerson}
                        label={connection.label}
                        onRemove={() => onRemoveConnection(connection)}
                    />
                ))}
            </TreeRail>

            {children.length ? (
                <>
                    <VerticalStem />
                    <TreeRail>
                        {children.map(({ connection, person: linkedPerson }) => (
                            <TreePersonNode
                                key={connection.id}
                                person={linkedPerson}
                                label={connection.label}
                                onRemove={() => onRemoveConnection(connection)}
                            />
                        ))}
                    </TreeRail>
                </>
            ) : null}

            {inLaws.length ? (
                <div className="mt-5 border-t border-dashed border-[#F0E8E5] pt-4">
                    <p className="mb-3 text-center text-3xs font-semibold tracking-[0.08em] text-neutral-400 uppercase">
                        In-laws
                    </p>
                    <TreeRail>
                        {inLaws.map(({ connection, person: linkedPerson }) => (
                            <TreePersonNode
                                key={connection.id}
                                person={linkedPerson}
                                label={connection.label}
                                onRemove={() => onRemoveConnection(connection)}
                            />
                        ))}
                    </TreeRail>
                </div>
            ) : null}
        </div>
    );
}

function CircleConnectionRow({ connection, linkedPerson, onRemove }) {
    return (
        <li className="group flex items-center gap-3 px-3 py-2.5">
            <Link
                href={`/persons/${linkedPerson.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 no-underline transition hover:opacity-80"
            >
                <Avatar person={linkedPerson} size="sm" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{linkedPerson.name}</p>
                    <RelationChip label={getConnectionLabel(connection.label)} accent />
                </div>
            </Link>
            <button
                type="button"
                onClick={() => onRemove(connection)}
                aria-label={`Remove ${linkedPerson.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-300 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
            >
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                    <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </button>
        </li>
    );
}

function SectionHeader({ icon: Icon, title, count, onAdd }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEA] text-[#D4625A]">
                    <Icon size={16} />
                </span>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
                        {count > 0 ? (
                            <span className="rounded-full bg-[#FAF8F7] px-2 py-0.5 text-3xs font-semibold text-neutral-500">
                                {count}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1 rounded-full border border-[#F0E8E5] bg-white px-3 py-1.5 text-2xs font-semibold text-[#D4625A] transition hover:border-[#D4625A]/35 hover:bg-[#FFFCFB]"
            >
                <PlusIcon size={11} />
                Add
            </button>
        </div>
    );
}

function EmptyState({ title, description, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-3xl border border-dashed border-[#E8D9D2] bg-white/80 px-5 py-6 text-center transition hover:border-[#D4625A]/40 hover:bg-[#FFFCFB]"
        >
            <p className="text-sm font-semibold text-neutral-800">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">{description}</p>
        </button>
    );
}

export function FamilyConnections({ person, persons }) {
    const { request } = useApiClient();
    const { data: connections, isLoading, refetch } = useFirebaseCollection('connections', { personId: person.id });
    const [modalMode, setModalMode] = useState(null);
    const [pendingRemove, setPendingRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const personById = useMemo(() => new Map(persons.map((item) => [item.id, item])), [persons]);
    const linkedIds = useMemo(() => new Set(connections.map((connection) => connection.linkedPersonId)), [connections]);

    const { family: familyConnections, circle: circleConnections } = useMemo(
        () => splitConnectionsByGroup(connections),
        [connections]
    );

    const resolvedCircle = circleConnections
        .map((connection) => ({
            connection,
            linkedPerson: personById.get(connection.linkedPersonId)
        }))
        .filter((item) => item.linkedPerson)
        .sort((a, b) => a.linkedPerson.name.localeCompare(b.linkedPerson.name));

    const pendingRemoveName =
        pendingRemove ? personById.get(pendingRemove.linkedPersonId)?.name || 'this connection' : '';

    function requestRemove(connection) {
        setPendingRemove(connection);
    }

    async function confirmRemove() {
        if (!pendingRemove) {
            return;
        }

        setIsRemoving(true);
        try {
            await request(`/api/connections/${pendingRemove.id}`, { method: 'DELETE' });
            setPendingRemove(null);
            refetch();
        } catch (error) {
            console.error('[FamilyConnections] Failed to remove connection:', error);
        } finally {
            setIsRemoving(false);
        }
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <SectionHeader
                    icon={HomeIcon}
                    title="Family tree"
                    count={familyConnections.length}
                    onAdd={() => setModalMode('family')}
                />

                {isLoading ? (
                    <div className="h-36 animate-pulse rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                ) : familyConnections.length ? (
                    <FamilyTreeVisualization
                        person={person}
                        connections={familyConnections}
                        personById={personById}
                        onRemoveConnection={requestRemove}
                    />
                ) : (
                    <EmptyState
                        title="No family yet"
                        description="Add parents, partners, siblings, or in-laws."
                        onClick={() => setModalMode('family')}
                    />
                )}
            </div>

            <div className="flex flex-col gap-3">
                <SectionHeader
                    icon={FriendsIcon}
                    title="Friends & circle"
                    count={resolvedCircle.length}
                    onAdd={() => setModalMode('circle')}
                />

                {isLoading ? (
                    <div className="h-24 animate-pulse rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                ) : resolvedCircle.length ? (
                    <ul className="divide-y divide-[#F0E8E5] overflow-hidden rounded-3xl border border-[#F0E8E5] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                        {resolvedCircle.map(({ connection, linkedPerson }) => (
                            <CircleConnectionRow
                                key={connection.id}
                                connection={connection}
                                linkedPerson={linkedPerson}
                                onRemove={requestRemove}
                            />
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        title="No circle yet"
                        description="Add friends, colleagues, roommates, or neighbors."
                        onClick={() => setModalMode('circle')}
                    />
                )}
            </div>

            {modalMode ? (
                <AddConnectionModal
                    person={person}
                    persons={persons}
                    excludedPersonIds={linkedIds}
                    defaultGroup={modalMode}
                    onClose={() => setModalMode(null)}
                    onSaved={() => {
                        refetch();
                        setModalMode(null);
                    }}
                />
            ) : null}

            <ConfirmDialog
                open={Boolean(pendingRemove)}
                message={`Remove ${pendingRemoveName} from ${person.name}'s connections?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                onConfirm={confirmRemove}
                onCancel={() => {
                    if (!isRemoving) {
                        setPendingRemove(null);
                    }
                }}
                isLoading={isRemoving}
            />
        </section>
    );
}
