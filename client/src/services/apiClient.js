// Simula la latencia/forma de una llamada real a la futura Web API.
// El día que exista el backend, alcanza con reescribir el cuerpo de las
// funciones de cada *Service.js (usar fetch/axios en vez de arrays en
// memoria) sin tocar ninguna página ni componente que los consume.
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
