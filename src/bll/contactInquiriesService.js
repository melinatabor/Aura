import * as contactInquiriesDal from '../dal/contactInquiriesDal'
import { toContactInquiry, toContactInquiryRow } from '../mappers/contactInquiryMapper'

export async function submitInquiry(form) {
  const row = await contactInquiriesDal.insert(toContactInquiryRow(form))
  return toContactInquiry(row)
}

export async function getAll() {
  const rows = await contactInquiriesDal.getAll()
  return rows.map(toContactInquiry)
}
