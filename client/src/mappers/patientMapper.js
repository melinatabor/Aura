export function toPatient(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    documentId: row.document_id,
    birthDate: row.birth_date,
    phone: row.phone,
    email: row.email,
    address: row.address,
    registeredAt: row.registered_at,
    status: row.status,
  }
}

export function toPatientRow(patient) {
  return {
    first_name: patient.firstName,
    last_name: patient.lastName,
    document_id: patient.documentId,
    birth_date: patient.birthDate || null,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    ...(patient.status ? { status: patient.status } : {}),
  }
}
