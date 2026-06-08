export interface TicketHistory {
  department: string;
  action: string;
  comment: string;
  handledBy: string;
  date: string;
}

export interface Ticket {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Pending' | 'Closed';
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  currentDepartment: string;
  isClosable: boolean;
  history: TicketHistory[];
  description?: string;
  department?: string;
  createdAt?: string;
}

export interface MaintenanceIssue {
  machine: string;
  type: string;
  description: string;
  severity: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

export interface MachineUseHour {
  machine: string;
  hours: number;
  date: string;
}
