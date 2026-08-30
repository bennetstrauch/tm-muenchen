import { getSupabase } from '../supabase';

// A single row of the research corpus. Global, not tenant-scoped (ADR 0012):
// every center shows the identical library, so there is no `tenant` field.
export type Study = {
  id: string;
  topic: string;
  field: string;
  specialty: string;
  specificResults: string;
  isRctMeta: boolean;
  year?: number;
  authors: string;
  title: string;
  journal: string;
  abstract: string;
  abstractDe: string;
  citationRaw: string;
  citationRawDe: string;
  doiUrl?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Study {
  return {
    id: row.id,
    topic: row.topic,
    field: row.field ?? '',
    specialty: row.specialty ?? '',
    specificResults: row.specific_results ?? '',
    isRctMeta: row.is_rct_meta,
    year: row.year ?? undefined,
    authors: row.authors ?? '',
    title: row.title ?? '',
    journal: row.journal ?? '',
    abstract: row.abstract ?? '',
    abstractDe: row.abstract_de ?? '',
    citationRaw: row.citation_raw,
    citationRawDe: row.citation_raw_de ?? '',
    doiUrl: row.doi_url ?? undefined,
  };
}

export async function getStudies(): Promise<Study[]> {
  const { data } = await getSupabase()
    .from('studies')
    .select('*')
    .order('year', { ascending: false });
  return (data ?? []).map(fromRow);
}
