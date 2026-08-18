// Simulates the latency/shape of a real future Web API call.
// Once the backend exists, it's enough to rewrite the body of each
// *Service.js function (use fetch/axios instead of in-memory arrays)
// without touching any page or component that consumes them.
export function resolveAsync(value, delay = 150) {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay))
}

const counters = {}

export function nextId(entity, list) {
  if (counters[entity] === undefined) {
    counters[entity] = list.reduce((max, item) => Math.max(max, item.id), 0)
  }
  counters[entity] += 1
  return counters[entity]
}

export function todayISO(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}
