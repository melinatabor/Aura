import { useState } from 'react'
import EmployeesTab from './EmployeesTab.jsx'
import ProfessionalsTab from './ProfessionalsTab.jsx'
import RolesTab from './RolesTab.jsx'
import InvitationsTab from './InvitationsTab.jsx'
import './Employees.scss'

const TABS = [
  { key: 'employees', label: 'Empleados', component: EmployeesTab },
  { key: 'professionals', label: 'Profesionales', component: ProfessionalsTab },
  { key: 'roles', label: 'Roles y permisos', component: RolesTab },
  { key: 'invitations', label: 'Invitaciones', component: InvitationsTab },
]

export default function EmployeesRoles() {
  const [activeKey, setActiveKey] = useState('employees')
  const ActiveTab = TABS.find((t) => t.key === activeKey).component

  return (
    <div>
      <div className="page-header">
        <h1>Empleados y roles</h1>
        <p>Administrá quién usa AURA, qué puede hacer cada rol y qué tratamientos realiza cada profesional.</p>
      </div>

      <div className="page-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={tab.key === activeKey}
            className={tab.key === activeKey ? 'active' : ''}
            onClick={() => setActiveKey(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveTab />
    </div>
  )
}
