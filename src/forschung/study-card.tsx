'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Study } from '@/lib/forschung/studies';
import { isTopic, TOPIC_ACCENT } from './topics';
import { TopicIcon } from './topic-icon';

// A clean citation built from the parsed fields, falling back to the raw source
// cell when parsing found no title (see parse-citation.ts / citationRaw contract).
function formatCitation(study: Study): string {
  if (!study.title) return study.citationRaw;
  return [
    study.authors,
    study.year ? `(${study.year})` : '',
    study.title,
    study.journal,
  ]
    .filter(Boolean)
    .join('. ');
}

export function StudyCard({ study }: { study: Study }) {
  const t = useTranslations('library');
  const tTopics = useTranslations('topics');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);

  // German UI prefers the sheet's German abstract where filled; other locales
  // fall back to the source-language abstract until the yearly batch backfills.
  const abstract = locale === 'de' && study.abstractDe ? study.abstractDe : study.abstract;
  const accent = isTopic(study.topic) ? TOPIC_ACCENT[study.topic] : '#3D5573';

  return (
    <article className="rounded-xl border border-[#1A3352]/10 bg-white p-5 shadow-[0_1px_3px_rgba(26,51,82,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isTopic(study.topic) && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
            style={{ backgroundColor: `${accent}14`, color: accent }}
          >
            <TopicIcon topic={study.topic} size={14} />
            {tTopics(study.topic)}
          </span>
        )}
        {study.specialty && (
          <span className="rounded-full bg-[#1A3352]/6 px-2.5 py-1 text-[0.7rem] text-[#3D5573]">
            {study.specialty}
          </span>
        )}
        {study.year && (
          <span className="rounded-full bg-[#1A3352]/6 px-2.5 py-1 text-[0.7rem] text-[#3D5573]">
            {study.year}
          </span>
        )}
        {study.isRctMeta && (
          <span className="rounded-full bg-[#BCA075]/15 px-2.5 py-1 text-[0.7rem] font-medium text-[#8a6d3b]">
            {t('rctBadge')}
          </span>
        )}
      </div>

      {study.specificResults && (
        <h2 className="font-display text-[1.35rem] leading-snug text-[#1A3352] mb-2">
          {study.specificResults}
        </h2>
      )}

      <p className="text-[0.85rem] text-[#3D5573] leading-relaxed">{formatCitation(study)}</p>

      {abstract && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-[0.8rem] font-medium text-[#2E7B8C] hover:underline underline-offset-2"
          >
            {expanded ? t('hideAbstract') : t('showAbstract')}
          </button>
          {expanded && (
            <p className="mt-2 text-[0.9rem] text-[#3D5573] leading-relaxed">{abstract}</p>
          )}
        </div>
      )}

      {study.doiUrl && (
        <a
          href={study.doiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[#1A3352] hover:underline underline-offset-2"
        >
          {t('publicationLink')}
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}
