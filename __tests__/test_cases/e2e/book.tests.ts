import { Chance } from 'chance'
import { Book } from '../../../lib/entities'
import * as given from '../../steps/given'
import * as when from '../../steps/when'

const chance = new Chance()

describe('Given an authenticated user', () => {
  let user: given.IAuthenticatedUser
  beforeAll(async () => {
    user = await given.an_authenticated_user()
  })

  describe('When they create a new book', () => {
    let book: Book
    const title = chance.sentence({ words: 5 })
    const description = chance.paragraph()
    beforeAll(async () => {
      book = await when.a_user_calls_create_book(user, title, description)
    })

    it('Should return the new book', () => {
      expect(book).toMatchObject({
        title: title,
        description: description,
        createdBy: user.id,
        updatedBy: user.id
      })
    })
  })
})
