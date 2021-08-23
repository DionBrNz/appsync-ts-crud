import { AppSyncResult } from '../../../lib/appsync'
import { Book } from '../../../lib/entities'
import { Chance } from 'chance'
import * as given from '../../steps/given'
import * as when from '../../steps/when'
import * as then from '../../steps/then'
import { dateRegex } from '../../../lib/consts'

const chance = new Chance()

describe('Given an anuthenicated user', () => {
  let user: given.IAuthenticatedUser
  beforeAll(async () => {
    user = await given.an_authenticated_user()
  })

  describe('When they create a book', () => {
    let appSyncResult: AppSyncResult<Book>
    let bookId: string

    const title = chance.sentence({ words: 5 })
    const description = chance.paragraph()

    beforeAll(async () => {
      appSyncResult = await when.we_invoke_create_book(user, title, description)
      bookId = appSyncResult.data!.id
    })

    it('Saves the book in the dynamo table', async () => {
      const book = await then.book_exists_in_books_table(bookId)

      expect(book).toMatchObject<Book>({
        id: bookId,
        title: title,
        description: description,
        createdAt: expect.stringMatching(dateRegex),
        createdBy: user.id,
        updatedAt: expect.stringMatching(dateRegex),
        updatedBy: user.id
      })
    })
  })
})
