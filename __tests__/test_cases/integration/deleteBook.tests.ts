import { Chance } from 'chance'
import { ulid } from 'ulid'
import { Book } from '../../../lib/entities'
import * as given from '../../steps/given'
import * as when from '../../steps/when'
import * as then from '../../steps/then'

const chance = new Chance()

describe('Give an anuthenticated user has already created a book', () => {
  let user: given.IAuthenticatedUser
  let existingBook: Book

  beforeAll(async () => {
    user = await given.an_authenticated_user()
    const title = chance.sentence({ words: 5 })
    const description = chance.paragraph()
    const { data } = await when.we_invoke_create_book(user, title, description)
    existingBook = data!
  })

  describe('They delete the book', () => {
    let deletedBook: Book
    beforeAll(async () => {
      const { data } = await when.we_invoke_delete_book(user, existingBook.id)
      deletedBook = data!
    })

    it('Returns an error when the book is not found', async () => {
      const badBookId = ulid()
      const { data, errorMessage, errorType, errorInfo } = await when.we_invoke_delete_book(user, badBookId)
      expect(data).toBeNull()
      expect(errorType).toBe('NotFound')
      expect(errorMessage).toBe('Book not found')
      expect(errorInfo).toMatchObject({ bookId: badBookId })
    })

    it('Deletes the book in the books table', async () => {
      const book = await then.book_exists_in_books_table(deletedBook.id)

      expect(book).toBeNull
    })

    it('Returns the existing book when you delete the book', () => {
      expect(deletedBook).toMatchObject(existingBook)
    })
  })
})
