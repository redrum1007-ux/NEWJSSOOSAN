export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  priceText: string;
  tag: string;
  img: string;
  detail: string;
  origin: string;
  weight: string;
  category?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: '대왕 전복',
    desc: '완도산 최상급 대형 전복',
    price: 185000,
    priceText: '185,000',
    tag: 'Best',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7NxlmVsIvX5MbcZso5jYpkS_8oIGMVq3cB3xymowbMs5PJLva5chID9hY7SB7jUcEBErg7vFfn_t--rTUiXs3nlrS4EQ6j7F6x4BXubiceJwgntCyfkUo5UGMQ24VfVwmhG8Rr1Q7TUBgzmUc_tEo-bbmzzR2cJJNTc0Gl-MYwPgi_w0OE6hnpQUq5LI34uPkUvfOeQ-QAoAz0Y-yXJI5j8oZK5pmg6Y5T-UAO3q6fdsJFzhEYkCUix8DULJGFHSqPLd4bH6e4-sD',
    detail: '청정 완도 바다에서 직접 양식한 최상급 대형 전복입니다. 살이 도톰하고 쫄깃한 식감이 일품이며, 전복죽, 전복구이, 전복찜 등 다양한 요리에 활용 가능합니다. 신선한 상태로 산지 직송하여 최고의 맛을 보장합니다.',
    origin: '전라남도 완도군',
    weight: '1kg (약 8-10마리)',
    category: '김',
  },
  {
    id: '2',
    name: '프리미엄 선물 세트',
    desc: '품격 있는 보자기 포장 서비스',
    price: 240000,
    priceText: '240,000',
    tag: '',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaTp38Hnktwf2dss89asBJJ6l85moJqs0OpNEOoiLapF0K-pUi5ruurSeuzR6X0vnfYNFA81LUcO184QBUbc4WMH5Jq7EHoblnlx3oAEh7voZNqK_EpmMW_WJs0kc-1sCq7gIkSqVGNDU8h_DVwJrC2OilJgpfE8uzyrvUPJskDy1WpXY4sGtvo1EjDrwTVJX8HdDonpnilxySYlQyHg7ZoNXnI7ieMCR-yeX9xdpm0U9HuFiWTwc3ZSPTyH4_BdM3-lCu8N85QFW',
    detail: '진성네이처푸드의 베스트 상품을 한데 모은 프리미엄 선물 세트입니다. 고급 보자기 포장으로 명절, 기념일, 비즈니스 선물로 최적입니다. 전복, 멸치, 다시마, 미역 등 엄선된 건어물을 정성껏 구성했습니다.',
    origin: '국내산 (완도, 기장, 진도)',
    weight: '종합 세트 (약 2.5kg)',
    category: '선물세트',
  },
  {
    id: '3',
    name: '골든 멸치 시리즈',
    desc: '자연의 황금빛 프리미엄 멸치',
    price: 58000,
    priceText: '58,000',
    tag: 'Limited',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbfg5jErbXaIzmK-X2eBVMDy64u5OlmwM78kSsh7mX9SHY2rmFScrkq86LR1Ty1u2_NuEtHjMtL1d6rgbebKxdw5iEDTgKWs67QKdvPP3vIv9FJfsHJMad2ghmcOKGgpg1J3Y5VB6oJrDJFhturL_xbnMhCWxC5ygyKgLFVKQt8reyDgWUZOp4hU78ZrqWIHSkpCmm8HvyFlvF2oBHJS6l65-9-sm1BwdOe0bgQrEymM2j7pMFFaRFMbs0T6EDokHFffyu7RjfuCQb',
    detail: '진도산 최상급 멸치를 엄선하여 자연 건조 방식으로 만든 황금빛 프리미엄 멸치입니다. 깊고 진한 국물맛을 자랑하며, 볶음멸치, 멸치국수, 다시용으로 최적입니다. 한정 수량 생산으로 품질을 보장합니다.',
    origin: '전라남도 진도군',
    weight: '500g',
    category: '멸치/새우',
  },
  {
    id: '4',
    name: '명품 영광 굴비',
    desc: '50년 전통의 법성포 해풍 건조',
    price: 129000,
    priceText: '129,000',
    tag: '',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFPg7Sd2wfGYhxiTnpAhIUEHdiXfcVkQ9WUmIsLIpKLjOe3Px0bzpm4Xfu4tMwROVx1dC2OjATkIonnra25CK8_VYWZcN0tjXin-fBCXOeEOmSBJIaDN0Oy7uZM9xOJorGoGkcavmUK-yrpj1dTl7VEV6oP7xt8c-5vMLYH7rLO24s5SvQfrxFF0UVwPuPaaylbU_1ZtIKRwW_TCG2i07YPZ3Caact_BmL3O1F6dENYDn1qjU9syN1nkTad7Ik3m3b7CZNRJAO8fJc',
    detail: '법성포의 청정 해풍으로 자연 건조한 명품 영광 굴비입니다. 50년 전통의 장인 기술로 만들어 특유의 깊은 감칠맛과 짭조름한 풍미가 일품입니다. 명절 선물, 제수용으로 가장 사랑받는 최고급 굴비입니다.',
    origin: '전라남도 영광군 법성포',
    weight: '10마리 (약 2kg)',
    category: '굴비/생선',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
