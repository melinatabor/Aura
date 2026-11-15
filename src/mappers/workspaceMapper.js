export function toWorkspace(row) {
  return {
    name: row.name,
    activityType: row.activity_type,
    businessEmail: row.business_email,
    businessPhone: row.business_phone,
    address: row.address,
    allowAppointmentOverlap: row.allow_appointment_overlap,
  }
}

export function toWorkspaceRow(workspace) {
  return {
    name: workspace.name,
    activity_type: workspace.activityType,
    business_email: workspace.businessEmail,
    business_phone: workspace.businessPhone,
    address: workspace.address,
    allow_appointment_overlap: workspace.allowAppointmentOverlap,
  }
}

export function toScheduleRange(row) {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    openingTime: row.opening_time?.slice(0, 5),
    closingTime: row.closing_time?.slice(0, 5),
    isActive: row.is_active,
  }
}

export function toScheduleRangeRow(range) {
  return { opening_time: range.openingTime, closing_time: range.closingTime, is_active: range.isActive }
}
