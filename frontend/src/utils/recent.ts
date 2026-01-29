const KEY = "recent_docs";

export function getRecent() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function addRecent(doc: any) {
  const list = getRecent().filter((d: any) => d.id !== doc.id);
  list.unshift(doc);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
}
