export const PRODUCT_CATEGORIES = [
  '프리미엄 건어물',
  '김',
  '멸치/새우',
  '미역/다시마',
  '굴비/생선',
  '선물세트',
  '기타',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const SHOP_CATEGORIES = [
  { label: '전체 상품', value: '' },
  { label: '프리미엄 건어물', value: '프리미엄 건어물' },
  { label: '김', value: '김' },
  { label: '멸치/새우', value: '멸치/새우' },
  { label: '미역/다시마', value: '미역/다시마' },
  { label: '굴비/생선', value: '굴비/생선' },
  { label: '선물세트 🎁', value: '선물세트' },
  { label: '기타', value: '기타' },
];

/**
 * 1차 수산물 / 건어물은 부가세 면세 대상입니다.
 * 이 카테고리에 속한 상품의 금액은 taxFreeAmount 로 계산됩니다.
 * 선물세트는 가공식품이 포함될 수 있으므로 과세로 분류합니다.
 */
export const TAX_FREE_CATEGORIES: string[] = [
  '프리미엄 건어물',
  '김',
  '멸치/새우',
  '미역/다시마',
  '굴비/생선',
];
