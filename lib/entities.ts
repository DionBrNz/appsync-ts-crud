export type User = {
  id: string
  email: string
  created: string
}

export type Book = {
  id: string
  title: string
  description: string
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}
