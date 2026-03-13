import { Customer, FollowUpEvent, User } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: '张伟', role: '销售主管', team: '管理层' },
  { id: 'u2', name: '李娜', role: '销售经理', team: 'A组' },
  { id: 'u3', name: '王强', role: '普通销售', team: 'A组' },
  { id: 'u4', name: '赵敏', role: '销售经理', team: 'B组' },
  { id: 'u5', name: '孙凯', role: '普通销售', team: 'B组' },
];

const baseCustomers: Customer[] = [
  {
    id: 'c1',
    name: '刘总',
    company: '北京科技发展有限公司',
    title: 'CEO',
    email: 'liu@beijingtech.com',
    phone: '13800138000',
    status: '意向客户',
    assignedTo: 'u1',
    lastContactDate: '2023-10-25T10:00:00Z',
    createdAt: '2023-09-01T08:00:00Z',
    dealValue: 150000,
  },
  {
    id: 'c2',
    name: '陈经理',
    company: '上海贸易集团',
    title: '采购总监',
    email: 'chen@shanghaitrade.com',
    phone: '13900139000',
    status: '谈判中',
    assignedTo: 'u2',
    lastContactDate: '2023-10-26T14:30:00Z',
    createdAt: '2023-09-15T09:00:00Z',
    dealValue: 320000,
  },
  {
    id: 'c3',
    name: '赵总监',
    company: '广州创新制造',
    title: '技术总监',
    email: 'zhao@gzchuangxin.com',
    phone: '13700137000',
    status: '潜在客户',
    assignedTo: 'u3',
    lastContactDate: '2023-10-20T11:00:00Z',
    createdAt: '2023-10-01T10:00:00Z',
  },
];

const surnames = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章', '云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常', '乐', '于', '时', '傅', '皮', '卞', '齐', '康', '伍', '余', '元', '卜', '顾', '孟', '平', '黄', '和', '穆', '萧', '尹'];
const names = ['伟', '芳', '娜', '敏', '静', '秀英', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英'];
const companies = ['科技', '贸易', '制造', '创新', '实业', '网络', '信息', '传媒', '教育', '咨询', '金融', '投资', '地产', '医疗', '生物', '能源', '环保', '新材料', '半导体', '人工智能'];
const companySuffixes = ['有限公司', '集团', '股份有限公司', '合伙企业'];
const titles = ['CEO', 'CTO', '采购总监', '销售经理', '产品经理', '运营总监', '市场总监', 'HRD', '财务总监', '技术专家', '业务主管', '总经理'];
const statuses: Customer['status'][] = ['潜在客户', '意向客户', '谈判中', '已成交', '已流失'];
const userIds = ['u1', 'u2', 'u3', 'u4', 'u5'];

const generateCustomers = (count: number): Customer[] => {
  const result: Customer[] = [...baseCustomers];
  let seed = 1;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 4; i <= count; i++) {
    const surname = surnames[Math.floor(random() * surnames.length)];
    const name = names[Math.floor(random() * names.length)];
    const company = surnames[Math.floor(random() * surnames.length)] + companies[Math.floor(random() * companies.length)] + companySuffixes[Math.floor(random() * companySuffixes.length)];
    const status = statuses[Math.floor(random() * statuses.length)];
    const assignedTo = userIds[Math.floor(random() * userIds.length)];
    
    const now = new Date();
    const createdDate = new Date(now.getTime() - random() * 180 * 24 * 60 * 60 * 1000);
    const lastContactDate = new Date(createdDate.getTime() + random() * (now.getTime() - createdDate.getTime()));

    let dealValue;
    let dealDate;
    if (status === '已成交' || status === '谈判中' || status === '意向客户') {
      dealValue = Math.floor(random() * 49 + 1) * 10000; // 10,000 to 500,000
    }
    if (status === '已成交') {
      dealDate = new Date(createdDate.getTime() + random() * (now.getTime() - createdDate.getTime())).toISOString();
    }

    result.push({
      id: `c${i}`,
      name: `${surname}${name}`,
      company,
      title: titles[Math.floor(random() * titles.length)],
      email: `user${i}@example.com`,
      phone: `13${Math.floor(random() * 900000000 + 100000000)}`,
      status,
      assignedTo,
      lastContactDate: lastContactDate.toISOString(),
      createdAt: createdDate.toISOString(),
      dealValue,
      dealDate,
    });
  }
  return result;
};

export const mockCustomers: Customer[] = generateCustomers(125);

const baseEvents: FollowUpEvent[] = [
  {
    id: 'e1',
    customerId: 'c1',
    salespersonId: 'u1',
    type: '电话沟通',
    date: '2023-10-20T10:00:00Z',
    description: '初步沟通了客户的需求，客户对我们的SaaS产品比较感兴趣，特别是自动化营销模块。',
    nextStep: '发送产品介绍资料和报价单。',
    attachments: [
      { id: 'a1', name: '需求沟通记录.pdf', type: 'application/pdf', url: '#' }
    ]
  },
  {
    id: 'e2',
    customerId: 'c1',
    salespersonId: 'u1',
    type: '线上会议',
    date: '2023-10-25T10:00:00Z',
    description: '进行了产品Demo演示，客户技术团队参与了会议，提出了一些关于数据安全的问题，已当场解答。',
    nextStep: '准备针对其技术团队的安全白皮书。',
    attachments: [
      { id: 'a2', name: '产品演示会议录音.mp3', type: 'audio/mp3', url: '#' },
      { id: 'a3', name: '会议纪要.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '#' }
    ]
  },
  {
    id: 'e3',
    customerId: 'c2',
    salespersonId: 'u2',
    type: '上门拜访',
    date: '2023-10-26T14:30:00Z',
    description: '拜访了客户公司，与采购总监及业务部门负责人面谈。明确了第一期采购预算和时间表。',
    nextStep: '下周二前提交正式的商业建议书。',
    attachments: [
      { id: 'a4', name: '现场拜访照片.jpg', type: 'image/jpeg', url: '#' }
    ]
  },
];

const eventTypes: FollowUpEvent['type'][] = ['电话沟通', '线上会议', '上门拜访', '邮件沟通', '其他'];
const eventDescriptions = [
  '初步沟通了客户的需求，客户对我们的SaaS产品比较感兴趣。',
  '进行了产品Demo演示，解答了客户关于数据安全的问题。',
  '拜访了客户公司，与业务部门负责人面谈，明确了第一期采购预算。',
  '发送了产品介绍资料和报价单，等待客户内部评估。',
  '客户反馈价格偏高，需要内部再讨论一下，下周继续跟进。',
  '沟通了合同细节，法务正在审核条款。',
  '确认了最终的采购清单，准备走内部审批流程。',
  '客户目前没有明确需求，保持定期回访。',
  '介绍了最新上线的功能模块，客户表示会在下个季度考虑增购。',
  '处理了客户在使用过程中的一些疑问，客户满意度较高。',
  '客户询问了关于售后服务支持的细节，已详细解答并发送服务手册。',
  '邀请客户参加了我们举办的行业沙龙，客户反馈良好。',
  '客户正在对比竞品，我们强调了在数据分析方面的核心优势。',
  '完成了POC测试，客户技术团队对性能指标表示认可。',
  '催促客户尽快走完付款流程，财务表示预计下周三打款。'
];
const nextSteps = [
  '下周二再次电话回访。',
  '准备针对其技术团队的安全白皮书。',
  '下周前提交正式的商业建议书。',
  '等待客户反馈，适时推进。',
  '申请特殊折扣审批。',
  '修改合同条款并重新发送。',
  '准备实施方案和排期。',
  '一个月后再次联系。',
  '邀请参加下个月的线下沙龙活动。',
  '无明确下一步，保持关注。',
  '跟进法务审批进度。',
  '安排技术支持团队进行对接。',
  '准备竞品分析报告发送给客户。',
  '确认最终的实施时间表。'
];

const generateEvents = (customers: Customer[]): FollowUpEvent[] => {
  const result: FollowUpEvent[] = [...baseEvents];
  let eventIdCounter = 4;
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate events for all customers
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    // Generate 2 to 6 events per customer
    const numEvents = Math.floor(random() * 5) + 2;
    
    const customerCreated = new Date(customer.createdAt).getTime();
    const customerLastContact = new Date(customer.lastContactDate || customer.createdAt).getTime();

    for (let j = 0; j < numEvents; j++) {
      const type = eventTypes[Math.floor(random() * eventTypes.length)];
      const description = eventDescriptions[Math.floor(random() * eventDescriptions.length)];
      const nextStep = nextSteps[Math.floor(random() * nextSteps.length)];
      
      // Random date between created and last contact
      const timeDiff = customerLastContact - customerCreated;
      const eventDate = new Date(customerCreated + random() * (timeDiff > 0 ? timeDiff : 86400000));

      result.push({
        id: `e${eventIdCounter++}`,
        customerId: customer.id,
        salespersonId: customer.assignedTo,
        type,
        date: eventDate.toISOString(),
        description,
        nextStep,
      });
    }
  }
  
  // Sort events by date descending
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockEvents: FollowUpEvent[] = generateEvents(mockCustomers);
