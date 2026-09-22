import * as alertRulesDal from '../dal/alertRulesDal'
import { toAlertRules, toAlertRulesRow } from '../mappers/alertRulesMapper'

export async function getRules() {
  const row = await alertRulesDal.get()
  return toAlertRules(row)
}

export async function updateRules(data) {
  const row = await alertRulesDal.update(toAlertRulesRow(data))
  return toAlertRules(row)
}
