'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Study } from '@/lib/forschung/studies';
import { filterStudies, specialtiesForTopic } from '@/lib/forschung/filter-studies';
import { TOPICS, TOPIC_ACCENT, type Topic } from './topics';
import { TopicIcon } from './topic-icon';
import { StudyCard } from './study-card';

export function Library({ studies }: { studies: Study[] }) {
  const t = useTranslations('library');
  const tTopics = useTranslations('topics');

  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState<Topic | ''>('');
  const [specialty, setSpecialty] = useState('');
  const [rctOnly, setRctOnly] = useState(false);

  const specialties = useMemo(
    () => (topic ? specialtiesForTopic(studies, topic) : []),
    [studies, topic],
  );

  const filtered = useMemo(
    () => filterStudies(studies, { keyword, topic, specialty, rctOnly }),
    [studies, keyword, topic, specialty, rctOnly],
  );

  function selectTopic(next: Topic | '') {
    setTopic(next);
    setSpecialty('');
  }

  const hasFilters = keyword !== '' || topic !== '' || specialty !== '' || rctOnly;

  function clearFilters() {
    setKeyword('');
    setTopic('');
    setSpecialty('');
    setRctOnly(false);
  }

  const chipBase =
    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-light text-[2.25rem] sm:text-[2.75rem] leading-tight mb-3">
          {t('title')}
        </h1>
        <p className="text-base text-[#3D5573] leading-relaxed max-w-2xl">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="w-full rounded-xl border border-[#1A3352]/15 bg-white px-4 py-3 text-base placeholder:text-[#3D5573]/50 focus:border-[#1A3352]/40 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('topicLabel')}>
          <button
            type="button"
            onClick={() => selectTopic('')}
            aria-pressed={topic === ''}
            className={`${chipBase} ${
              topic === ''
                ? 'border-[#1A3352] bg-[#1A3352] text-white'
                : 'border-[#1A3352]/15 bg-white text-[#3D5573] hover:border-[#1A3352]/40'
            }`}
          >
            {t('allTopics')}
          </button>
          {TOPICS.map((tp) => {
            const active = topic === tp;
            return (
              <button
                key={tp}
                type="button"
                onClick={() => selectTopic(tp)}
                aria-pressed={active}
                className={`${chipBase} ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-[#1A3352]/15 bg-white text-[#3D5573] hover:border-[#1A3352]/40'
                }`}
                style={active ? { backgroundColor: TOPIC_ACCENT[tp] } : undefined}
              >
                <TopicIcon topic={tp} size={16} style={active ? undefined : { color: TOPIC_ACCENT[tp] }} />
                {tTopics(tp)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {specialties.length > 0 && (
            <label className="flex items-center gap-2 text-[0.8rem] text-[#3D5573]">
              <span className="sr-only">{t('specialtyLabel')}</span>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                aria-label={t('specialtyLabel')}
                className="rounded-lg border border-[#1A3352]/15 bg-white px-3 py-2 text-[0.85rem] text-[#1A3352] focus:border-[#1A3352]/40 focus:outline-none"
              >
                <option value="">{t('allSpecialties')}</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={() => setRctOnly((v) => !v)}
            aria-pressed={rctOnly}
            className={`${chipBase} ${
              rctOnly
                ? 'border-[#BCA075] bg-[#BCA075] text-white'
                : 'border-[#1A3352]/15 bg-white text-[#3D5573] hover:border-[#1A3352]/40'
            }`}
          >
            {t('rctToggle')}
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[0.8rem] text-[#3D5573] underline underline-offset-2 hover:text-[#1A3352]"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      <p className="text-[0.8rem] text-[#3D5573] mb-4" aria-live="polite">
        {t('resultCount', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1A3352]/20 bg-white px-6 py-10 text-center text-[#3D5573]">
          {t('empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((study) => (
            <li key={study.id}>
              <StudyCard study={study} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
