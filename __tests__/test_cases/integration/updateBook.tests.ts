import { Book } from '../../../lib/entities'
import { Chance } from 'chance'
import * as given from '../../steps/given'
import * as when from '../../steps/when'
import * as then from '../../steps/then'
import { dateRegex } from '../../../lib/consts'

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

  describe('When they update a book', () => {
    let updatedBook: Book

    const title = chance.sentence({ words: 5 })
    const description = chance.paragraph()

    beforeAll(async () => {
      const { data } = await when.we_invokde_update_book(user, existingBook.id, title, description)
      updatedBook = data!
    })

    it('Updates the book in the dynamodb table', async () => {
      const book = await then.book_exists_in_books_table(updatedBook.id)

      expect(book).toMatchObject<Book>({
        id: existingBook.id,
        createdBy: user.id,
        updatedBy: user.id,
        title: title,
        description: description,
        createdAt: expect.stringMatching(dateRegex),
        updatedAt: expect.stringMatching(dateRegex)
      })
    })
  })
})
