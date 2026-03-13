export type FollowUpType = '电话沟通' | '线上会议' | '上门拜访' | '邮件沟通' | '其他';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  data?: string;
  mimeType?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  team?: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  status: '潜在客户' | '意向客户' | '谈判中' | '已成交' | '已流失';
  assignedTo: string; // User ID
  lastContactDate?: string;
  createdAt: string;
  dealValue?: number;
  dealDate?: string;
}

export interface FollowUpEvent {
  id: string;
  customerId: string;
  salespersonId: string;
  type: FollowUpType;
  date: string;
  description: string;
  nextStep?: string;
  attachments?: Attachment[];
}
