import json
import os
import boto3
import uuid
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
textract = boto3.client('textract')

def handler(event, context):
    """Lambda entry point for PDF ingestion.
    Expects event with keys:
      - bucket: S3 bucket where PDF is uploaded
      - key:   S3 object key of the PDF
    """
    bucket = event['bucket']
    key = event['key']
    doc_id = str(uuid.uuid4())

    # Start Textract job (synchronous for simplicity)
    try:
        response = textract.analyze_document(
            Document={'S3Object': {'Bucket': bucket, 'Name': key}},
            FeatureTypes=['TABLES', 'FORMS']
        )
    except ClientError as e:
        print(f"Textract error: {e}")
        raise e

    # Extract raw text blocks
    blocks = response.get('Blocks', [])
    text_chunks = []
    for block in blocks:
        if block['BlockType'] == 'LINE':
            text_chunks.append(block['Text'])

    # Store raw Textract output in S3 (as JSON)
    raw_key = f"raw/{doc_id}.json"
    s3.put_object(
        Bucket=os.environ['DATA_LAKE_BUCKET'],
        Key=raw_key,
        Body=json.dumps(blocks).encode('utf-8')
    )

    # Store each chunk in DynamoDB for later retrieval
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['KNOWLEDGE_TABLE'])
    with table.batch_writer() as batch:
        for idx, chunk in enumerate(text_chunks):
            batch.put_item(Item={
                'docId': doc_id,
                'chunkId': str(idx),
                'content': chunk,
                'sourceKey': key,
                'rawKey': raw_key,
                'createdAt': int(context.get_remaining_time_in_millis())
            })

    return {
        'statusCode': 200,
        'body': json.dumps({
            'docId': doc_id,
            'chunkCount': len(text_chunks),
            'rawKey': raw_key
        })
    }
