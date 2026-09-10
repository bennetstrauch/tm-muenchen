import type { Study } from './studies';

export type StudyFilter = {
  keyword?: string;
  topic?: string;
  specialty?: string;
  rctOnly?: boolean;
};

// Pure, client-side corpus filter. Criteria compose with AND. A Specialty is
// only meaningful together with its Topic — because both must match, a Specialty
// from another Topic naturally yields nothing (see specialtiesForTopic, which
// the UI uses to keep the Specialty options constrained to the chosen Topic).
export function filterStudies(studies: Study[], filter: StudyFilter): Study[] {
  const keyword = filter.keyword?.trim().toLowerCase() ?? '';

  return studies.filter((study) => {
    if (keyword) {
      const haystack = `${study.title} ${study.abstract}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (filter.topic && study.topic !== filter.topic) return false;
    if (filter.specialty && study.specialty !== filter.specialty) return false;
    if (filter.rctOnly && !study.isRctMeta) return false;
    return true;
  });
}

export function specialtiesForTopic(studies: Study[], topic: string): string[] {
  const specialties = new Set<string>();
  for (const study of studies) {
    if (study.topic === topic && study.specialty) specialties.add(study.specialty);
  }
  return [...specialties].sort((a, b) => a.localeCompare(b));
}
