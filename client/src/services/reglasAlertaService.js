import reglasMock from '../mocks/reglasAlerta.json'
import { resolveAsync } from './apiClient'

let reglas = { ...reglasMock }

export function getReglas() {
  return resolveAsync({ ...reglas })
}

export function updateReglas(data) {
  reglas = { ...reglas, ...data }
  return resolveAsync({ ...reglas })
}
