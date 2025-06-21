export type UserRole = 'admin' | 'user'

export interface Product {
  id: string
  nama_produk: string
  harga_satuan: number
  quantity: number
}
