import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda/trigger/cognito-user-pool-trigger'
import { User } from '../lib/entities'
import lambdaLogger from 'pino-lambda'
import { Context } from 'aws-lambda'

const { USERS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({})
const dynamoDocument = DynamoDBDocument.from(dynamoClient)
const logger = lambdaLogger()

export async function handler(
  event: PostConfirmationConfirmSignUpTriggerEvent,
  contex: Context
): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
  
  logger.withRequest(event, contex)
  if (event.triggerSource == 'PostConfirmation_ConfirmSignUp') {
    const user: User = {
      id: event.userName,
      email: event.request.userAttributes['email'],
      created: new Date().toISOString()
    }

    await dynamoDocument.put({
      TableName: USERS_TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(id)'
    })
    logger.info('Created user')

    return event
  } else {
    return event
  }
}
