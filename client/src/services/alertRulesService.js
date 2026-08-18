import rulesMock from '../mocks/alertRules.json'
import { resolveAsync } from './apiClient'

let rules = { ...rulesMock }

export function getRules() {
  return resolveAsync({ ...rules })
}

export function updateRules(data) {
  rules = { ...rules, ...data }
  return resolveAsync({ ...rules })
}
