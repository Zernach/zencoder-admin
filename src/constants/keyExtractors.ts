type KeyValue = string | number;

export type KeyExtractor<T> = (item: T) => string;

interface HasId {
  id: KeyValue;
}

interface HasKey {
  key: KeyValue;
}

interface HasUserId {
  userId: KeyValue;
}

interface HasAgentId {
  agentId: KeyValue;
}

interface HasProjectId {
  projectId: KeyValue;
}

export function createKeyExtractor<T>(selector: (item: T) => KeyValue): KeyExtractor<T> {
  return (item: T) => String(selector(item));
}

const byId = <T extends HasId>(item: T): string => String(item.id);
const byKey = <T extends HasKey>(item: T): string => String(item.key);
const byUserId = <T extends HasUserId>(item: T): string => String(item.userId);
const byAgentId = <T extends HasAgentId>(item: T): string => String(item.agentId);
const byProjectId = <T extends HasProjectId>(item: T): string => String(item.projectId);

export const keyExtractors = {
  byId,
  byKey,
  byUserId,
  byAgentId,
  byProjectId,
} as const;
