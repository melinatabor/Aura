export function toContactInquiry(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    activityType: row.activity_type,
    reason: row.reason,
    message: row.message,
    status: row.status,
  }
}

export function toContactInquiryRow(form) {
  return {
    full_name: form.name,
    email: form.email,
    phone: form.phone,
    activity_type: form.activityType,
    reason: form.reason,
    message: form.message,
  }
}
