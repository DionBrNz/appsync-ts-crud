import * as dotenv from 'dotenv'
import { DynamoDBClient, IdempotentParameterMismatchException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { User, Book } from '../../lib/entities'
import pino from 'pino'
dotenv.config()

const logger = pino()
const { USERS_TABLE_NAME, BOOKS_TABLE_NAME } = process.env

const dynamodbClient = new DynamoDBClient({})
const dynamodb = DynamoDBDocument.from(dynamodbClient)

export async function user_exists_in_users_table(id: string): Promise<User> {
  console.log(`Looking for user [${id}] in table [${USERS_TABLE_NAME}]`)

  const { Item: item } = await dynamodb.get({
    TableName: USERS_TABLE_NAME,
    Key: { id: id }
  })

  return item as User
}

export async function book_exists_in_books_table(bookId: string): Promise<Book> {
  logger.info({ bookId, BOOKS_TABLE_NAME }, 'Fetching Book')

  const { Item: item } = await dynamodb.get({
    TableName: BOOKS_TABLE_NAME,
    Key: { id: bookId }
  })

  return item as Book
}
