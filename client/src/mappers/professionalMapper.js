export function toProfessional(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    documentId: row.document_id,
    licenseNumber: row.license_number,
    phone: row.phone,
    email: row.email,
    specialty: row.specialty,
    status: row.status,
  }
}

export function toProfessionalRow(professional) {
  return {
    first_name: professional.firstName,
    last_name: professional.lastName,
    document_id: professional.documentId,
    license_number: professional.licenseNumber || null,
    phone: professional.phone,
    email: professional.email,
    specialty: professional.specialty,
    ...(professional.status ? { status: professional.status } : {}),
  }
}
