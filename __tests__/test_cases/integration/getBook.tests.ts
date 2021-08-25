import { Chance } from 'chance'
import { ulid } from 'ulid'
import { Book } from '../../../lib/entities'
import * as given from '../../steps/given'
import * as when from '../../steps/when'

const chance = new Chance()

describe('Given an authenticated user and a existing book', () => {
  let user: given.IAuthenticatedUser
  let existingBook: Book

  beforeAll(async () => {
    user = await given.an_authenticated_user()
    const title = chance.sentence({ words: 5 })
    const description = chance.paragraph()
    const { data } = await when.we_invoke_create_book(user, title, description)
    existingBook = data!
  })

  describe('When they get a book', () => {
    it('Returns the correct book from dynamodb', async () => {
      const { data } = await when.we_invokde_get_book(user, existingBook.id)
      const book: Book = data!
      expect(book).toMatchObject<Book>(existingBook)
    })

    it('Returns an error when the book is not found', async () => {
      const badBookId = ulid()
      const { data, errorMessage, errorType, errorInfo } = await when.we_invokde_get_book(user, badBookId)
      expect(data).toBeNull
      expect(errorType).toBe('NotFound')
      expect(errorMessage).toBe('Book not found')
      expect(errorInfo).toMatchObject({ bookId: badBookId })
    })
  })
})
