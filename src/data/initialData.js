export const initialServices = [
  {
    id: "haircut",
    nameEn: "Haircut & Styling",
    nameGu: "હેરકટ અને સ્ટાઇલિંગ",
    duration: 30,
    price: 150,
    icon: "Scissors",
    active: true
  },
  {
    id: "beard_trim",
    nameEn: "Beard Trim & Shape",
    nameGu: "દાઢી ટ્રીમ અને શેપિંગ",
    duration: 15,
    price: 80,
    icon: "Sparkles",
    active: true
  },
  {
    id: "hair_spa",
    nameEn: "Hair Spa & Treatment",
    nameGu: "હેર સ્પા અને ટ્રીટમેન્ટ",
    duration: 45,
    price: 400,
    icon: "ShowerHead",
    active: true
  },
  {
    id: "shave_facial",
    nameEn: "Royal Shave & Face Clean",
    nameGu: "રોયલ શેવ અને ફેસ ક્લીન",
    duration: 25,
    price: 180,
    icon: "Smile",
    active: true
  },
  {
    id: "head_massage",
    nameEn: "Aromatic Head Massage",
    nameGu: "હેડ મસાજ",
    duration: 20,
    price: 120,
    icon: "HeartHandshake",
    active: true
  },
  {
    id: "hair_color",
    nameEn: "Hair Color & Highlights",
    nameGu: "હેર કલર અને હાઇલાઇટ્સ",
    duration: 45,
    price: 350,
    icon: "Palette",
    active: true
  }
];

export const initialBarbers = [
  {
    id: "ravi",
    name: "Ravi",
    avatar: "👨‍🦱",
    chair: 1,
    onDuty: true,
    onBreak: false,
    status: "busy", // 'busy' | 'available' | 'on_break'
    currentTicketId: "S-12"
  },
  {
    id: "amit",
    name: "Amit",
    avatar: "🧔",
    chair: 2,
    onDuty: true,
    onBreak: false,
    status: "available",
    currentTicketId: null
  },
  {
    id: "imran",
    name: "Imran",
    avatar: "💇‍♂️",
    chair: 3,
    onDuty: true,
    onBreak: true,
    status: "on_break",
    currentTicketId: null
  }
];

export const initialTickets = [
  {
    id: "S-12",
    token: "S-12",
    name: "Rahul Sharma",
    phone: "9876543210",
    serviceIds: ["haircut", "beard_trim"],
    barberPreference: "ravi", // specific barber
    status: "in_chair", // 'waiting' | 'called' | 'in_chair' | 'done' | 'cancelled' | 'no_show'
    assignedBarberId: "ravi",
    createdAt: Date.now() - 40 * 60 * 1000,
    startedAt: Date.now() - 15 * 60 * 1000,
    completedAt: null
  },
  {
    id: "S-13",
    token: "S-13",
    name: "Hardik Patel",
    phone: "9825012345",
    serviceIds: ["haircut"],
    barberPreference: "any",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 28 * 60 * 1000,
    startedAt: null,
    completedAt: null
  },
  {
    id: "S-14",
    token: "S-14",
    name: "Kunal Shah",
    phone: "9898011223",
    serviceIds: ["haircut", "beard_trim"],
    barberPreference: "any",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 22 * 60 * 1000,
    startedAt: null,
    completedAt: null
  },
  {
    id: "S-15",
    token: "S-15",
    name: "Parth Joshi",
    phone: "9712345678",
    serviceIds: ["hair_spa"],
    barberPreference: "amit",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 18 * 60 * 1000,
    startedAt: null,
    completedAt: null
  },
  {
    id: "S-16",
    token: "S-16",
    name: "Chetan Vyas",
    phone: "9909988776",
    serviceIds: ["shave_facial"],
    barberPreference: "ravi",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 14 * 60 * 1000,
    startedAt: null,
    completedAt: null
  },
  {
    id: "S-17",
    token: "S-17",
    name: "Vikram Rathod",
    phone: "9426033445",
    serviceIds: ["head_massage", "haircut"],
    barberPreference: "any",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 9 * 60 * 1000,
    startedAt: null,
    completedAt: null
  },
  {
    id: "S-18",
    token: "S-18",
    name: "Jayesh Dave",
    phone: "9879544332",
    serviceIds: ["haircut"],
    barberPreference: "imran",
    status: "waiting",
    assignedBarberId: null,
    createdAt: Date.now() - 4 * 60 * 1000,
    startedAt: null,
    completedAt: null
  }
];

export const initialStats = {
  servedCount: 14,
  avgWait: 22,
  noShowCount: 1,
  totalRevenue: 3450
};
