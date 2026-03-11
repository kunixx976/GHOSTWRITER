import json
import os
import boto3
import uuid
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
textract = boto3.client('textract')


def handler(event, context):
    """Lambda entry point for reasoning using Bedrock (Claude 3.5 Sonnet).
    Expects event JSON with keys:
      - docId: ID of the document to reason about
      - query: The user question or instruction
    """
    doc_id = event.get('docId')
    query = event.get('query')
    if not doc_id or not query:
        return {'statusCode': 400, 'body': json.dumps({'error': 'docId and query required'})}

    # Retrieve relevant chunks from DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['KNOWLEDGE_TABLE'])
    # Simple scan (for demo); in production use query with GSI
    response = table.scan(FilterExpression=boto3.dynamodb.conditions.Attr('docId').eq(doc_id))
    chunks = [item['content'] for item in response.get('Items', [])]
    context_text = "\n".join(chunks)

    # Build prompt for Claude 3.5 Sonnet
    prompt = f"You are an academic assistant. Use the following extracted text from a PDF to answer the question.\n\nExtracted Text:\n{context_text}\n\nQuestion: {query}\n\nProvide a concise, accurate answer."

    bedrock = boto3.client('bedrock-runtime')
    try:
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
            body=json.dumps({
                'prompt': prompt,
                'max_tokens': 1024,
                'temperature': 0.2,
                'top_p': 0.9,
                'stop_sequences': []
            }).encode('utf-8'),
            contentType='application/json',
            accept='application/json'
        )
        result = json.loads(response['body'].read())
        answer = result.get('completion')
    except ClientError as e:
        print(f"Bedrock error: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Bedrock invocation failed'})}

    return {
        'statusCode': 200,
        'body': json.dumps({'answer': answer})
    }
