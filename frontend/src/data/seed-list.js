export const CATEGORIES = [
  { id: "home", label: "หน้าแรก" },
  { id: "women", label: "เสื้อผ้าผู้หญิง" },
  { id: "men", label: "เสื้อผ้าผู้ชาย" },
  { id: "acc", label: "อุปกรณ์เสริม" },
  { id: "sale", label: "ลดราคา" },
];

export const PRODUCTS = [
      {
    id: "p1",
    name: "เสื้อเชิ้ตคอตตอน",
    category: "men",
    price: 1290,
    compareAt: 1590,
    rating: 4.6,
    reviews: 89,
    colors: ["#e5e7eb", "#111827", "#f3f4f6"],
    isNew: false,
    isSale: true,
    image:
      "https://images.unsplash.com/photo-1520975954732-35dd221bb62a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p2",
    name: "กางเกงขายาวผ้าลินิน",
    category: "men",
    price: 1890,
    rating: 4.6,
    reviews: 89,
    colors: ["#e2e8f0", "#f7fee7", "#f1f5f9"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1618354691438-c7eac9745f07?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p3",
    name: "เดรสแขนยาว",
    category: "women",
    price: 2290,
    rating: 4.7,
    reviews: 120,
    colors: ["#0f172a", "#e2e8f0"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p4",
    name: "เสื้อยืดพรีเมียม",
    category: "men",
    price: 890,
    rating: 4.4,
    reviews: 67,
    colors: ["#111827", "#e5e7eb", "#94a3b8"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p5",
    name: "รองเท้าผ้าใบขาว",
    category: "acc",
    price: 2590,
    compareAt: 2990,
    rating: 4.6,
    reviews: 134,
    colors: ["#f8fafc", "#e2e8f0"],
    isNew: false,
    isSale: true,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p6",
    name: "กระเป๋าสะพายนังแท้",
    category: "acc",
    price: 3290,
    rating: 4.8,
    reviews: 67,
    colors: ["#111827", "#e5e7eb", "#b45309"],
    isNew: false,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1525966222134-7b74d18c3426?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p7",
    name: "กางเกงยีนส์ขายาว",
    category: "men",
    price: 2190,
    rating: 4.4,
    reviews: 92,
    colors: ["#1e3a8a", "#0f172a"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p8",
    name: "เสื้อสายเดี่ยวผ้าซาติน",
    category: "women",
    price: 1190,
    rating: 4.5,
    reviews: 58,
    colors: ["#f1f5f9", "#fde68a", "#fef9c3"],
    isNew: true,
    isSale: false,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
  },
]

export const accountSeed = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  avatar: "https://i.pravatar.cc/150?u=johndoe",
  address: "123 Main St, Bangkok, Thailand",
  phone: "081-234-5678",
  favorites: ["p1", "p5", "p3"],
  orders: [
    {
      id: "o1",
      date: "2023-08-15",
      total: 4580,
      items: [
        { productId: "p1", name: "เสื้อเชิ้ตคอตตอน", price: 1290, quantity: 1 },
        { productId: "p5", name: "รองเท้าผ้าใบขาว", price: 2590, quantity: 1 },
        { productId: "p3", name: "เดรสแขนยาว", price: 800, quantity: 1 },
      ],
      status: "จัดส่งแล้ว", // ตัวอย่างสถานะ: รอดำเนินการ, จัดส่งแล้ว, ยกเลิก
      trackingNumber: "TH1234567890",
    },
    {
      id: "o2",
      date: "2023-07-10",
      total: 1890,
      items: [
        { productId: "p2", name: "กางเกงขายาวผ้าลินิน", price: 1890, quantity: 1 },
      ],
      status: "จัดส่งแล้ว",
      trackingNumber: "TH0987654321",
    },
  ],
};