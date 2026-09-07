import type { Product } from '../legacy/types'

export const SAMPLE_PACKS = [
  {
    id: 'milk',
    title: 'Amul Taaza',
    ocrText: 'AMUL TAAZA TONED MILK 500ml',
    image: '/samples/packs/01-amul-milk.png',
    unitPrice: 32,
  },
  {
    id: 'parle-g',
    title: 'Parle-G',
    ocrText: 'PARLE-G GLUCOSE BISCUIT',
    image: '/samples/packs/02-parle-g.png',
    unitPrice: 10,
  },
  {
    id: 'maggi',
    title: 'Maggi',
    ocrText: 'MAGGI 2 MINUTE NOODLES',
    image: '/samples/packs/03-maggi.png',
    unitPrice: 14,
  },
  {
    id: 'chips',
    title: 'Lays Chips',
    ocrText: 'LAYS CHIPS POTATO CHIPS',
    image: '/samples/packs/04-lays-chips.png',
    unitPrice: 20,
  },
] as const

export const PRODUCT_CATALOG: Product[] = [
  { id: 'parle-g', name: 'Parle-G', aliases: ['parle g', 'parleg', 'glucose biscuit'], unitPrice: 10 },
  { id: 'maggi', name: 'Maggi', aliases: ['maggi noodles', 'noodles', '2 minute', '2 minute noodles'], unitPrice: 14 },
  { id: 'tata-salt', name: 'Tata Salt', aliases: ['salt', 'tata namak'], unitPrice: 28 },
  { id: 'aashirvaad', name: 'Aashirvaad Atta', aliases: ['atta', 'wheat flour', 'ashirvad atta'], unitPrice: 52 },
  { id: 'milk', name: 'Milk', aliases: ['amul milk', 'toned milk', 'amul', 'amul taaza', 'taaza'], unitPrice: 32 },
  { id: 'bread', name: 'Bread', aliases: ['britannia bread', 'pav'], unitPrice: 40 },
  { id: 'bisleri', name: 'Bisleri', aliases: ['water', 'mineral water'], unitPrice: 20 },
  { id: 'surf-excel', name: 'Surf Excel', aliases: ['detergent', 'surf'], unitPrice: 78 },
  { id: 'soap', name: 'Soap', aliases: ['lifebuoy', 'hamam'], unitPrice: 35 },
  { id: 'chips', name: 'Chips', aliases: ['lays', 'lay s', 'lays chips', 'potato chips'], unitPrice: 20 },
  { id: 'rice', name: 'Rice', aliases: ['basmati', 'sona masoori'], unitPrice: 68 },
  { id: 'oil', name: 'Oil', aliases: ['fortune oil', 'sunflower oil', 'refined oil'], unitPrice: 145 },
]
