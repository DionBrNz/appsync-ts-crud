import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda/trigger/cognito-user-pool-trigger";
import { User } from "../lib/entities";

const { USERS_TABLE_NAME } = process.env
const dynamoClient = new DynamoDBClient({});
const dynamoDocument = DynamoDBDocument.from(dynamoClient);

export async function handler(
  event: PostConfirmationConfirmSignUpTriggerEvent,
  contex: any
): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
  
  if (event.triggerSource == "PostConfirmation_ConfirmSignUp") {
    const user: User = {
      id: event.userName,
      email: event.request.userAttributes["email"],
      created: new Date().toISOString(),
    };

    await dynamoDocument.put({
      TableName: USERS_TABLE_NAME,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    });

    return event;
  } else {
    return event;
  }
}