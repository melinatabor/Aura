import treatmentsMock from '../mocks/treatments.json'
import treatmentSuppliesMock from '../mocks/treatmentSupplies.json'
import { resolveAsync, nextId } from './apiClient'

let treatments = [...treatmentsMock]
let treatmentSupplies = [...treatmentSuppliesMock]

export function getAll() {
  return resolveAsync([...treatments])
}

export function getActive() {
  return resolveAsync(treatments.filter((t) => t.status === 'Activo'))
}

export function getById(id) {
  return resolveAsync(treatments.find((t) => t.id === Number(id)) ?? null)
}

export function create(data) {
  const created = { id: nextId('treatments', treatments), status: 'Activo', ...data }
  treatments = [created, ...treatments]
  return resolveAsync(created)
}

export function update(id, data) {
  treatments = treatments.map((t) => (t.id === Number(id) ? { ...t, ...data } : t))
  return resolveAsync(treatments.find((t) => t.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  treatments = treatments.map((t) => (t.id === Number(id) ? { ...t, status } : t))
  return resolveAsync(true)
}

export function getSuppliesForTreatment(treatmentId) {
  return resolveAsync(treatmentSupplies.filter((ts) => ts.treatmentId === Number(treatmentId)))
}

export function setSuppliesForTreatment(treatmentId, relations) {
  treatmentSupplies = [
    ...treatmentSupplies.filter((ts) => ts.treatmentId !== Number(treatmentId)),
    ...relations.map((r) => ({ id: nextId('treatmentSupplies', treatmentSupplies), treatmentId: Number(treatmentId), ...r })),
  ]
  return resolveAsync(true)
}
