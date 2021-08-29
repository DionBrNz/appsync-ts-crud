import { Chance } from 'chance'
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
    it('Returns a list of books from dynamodb', async () => {
      const { data } = await when.we_invoke_list_books(user, 25, null)

      expect(data!.nextToken).toBeNull()
      expect(data!.books).toHaveLength(1)
      expect(data!.books[0]).toEqual(existingBook)
    })
  })
})
