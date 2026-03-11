import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_dynamodb as dynamodb, aws_lambda as lambda, aws_apigatewayv2 as apigateway, aws_apigatewayv2_integrations as integrations, aws_cloudfront as cloudfront, aws_cloudfront_origins as origins, aws_iam as iam, aws_logs as logs } from 'aws-cdk-lib';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---------- S3 Data Lake ----------
    const dataLake = new s3.Bucket(this, 'DataLakeBucket', {
      bucketName: cdk.Stack.of(this).stackName.toLowerCase() + '-datalake',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [{
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        expiration: cdk.Duration.days(365),
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        }],
      }],
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // ---------- DynamoDB Knowledge Vault ----------
    const knowledgeTable = new dynamodb.Table(this, 'KnowledgeTable', {
      tableName: cdk.Stack.of(this).stackName.toLowerCase() + '-knowledge',
      partitionKey: { name: 'docId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'chunkId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ---------- Lambda Functions ----------
    const ingestionLambda = new lambda.Function(this, 'IngestionLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'ingestion.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(5),
      environment: {
        DATA_LAKE_BUCKET: dataLake.bucketName,
        KNOWLEDGE_TABLE: knowledgeTable.tableName,
      },
    });

    const reasoningLambda = new lambda.Function(this, 'ReasoningLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'reasoning.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.minutes(2),
      environment: {
        KNOWLEDGE_TABLE: knowledgeTable.tableName,
      },
    });

    // Grant least‑privilege permissions
    dataLake.grantReadWrite(ingestionLambda);
    knowledgeTable.grantReadWriteData(ingestionLambda);
    knowledgeTable.grantReadData(reasoningLambda);

    // ---------- API Gateway (HTTP API) ----------
    const httpApi = new apigateway.HttpApi(this, 'GhostwriterHttpApi', {
      apiName: 'GhostwriterAPI',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [apigateway.CorsHttpMethod.GET, apigateway.CorsHttpMethod.POST, apigateway.CorsHttpMethod.OPTIONS],
        allowOrigins: ['*'],
        maxAge: cdk.Duration.days(10),
      },
    });

    // Integrations
    const ingestIntegration = new integrations.HttpLambdaIntegration('IngestIntegration', ingestionLambda);
    const reasonIntegration = new integrations.HttpLambdaIntegration('ReasonIntegration', reasoningLambda);

    httpApi.addRoutes({
      path: '/ingest',
      methods: [apigateway.HttpMethod.POST],
      integration: ingestIntegration,
    });
    httpApi.addRoutes({
      path: '/reason',
      methods: [apigateway.HttpMethod.POST],
      integration: reasonIntegration,
    });


    // ---------- CloudFront Distribution ----------
    const origin = new origins.HttpOrigin(httpApi.apiEndpoint.replace('https://', ''), {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });

    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: origin,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(5),
      }],
    });

    // Frontend bucket for static site
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: cdk.Stack.of(this).stackName.toLowerCase() + '-frontend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution for static site
    const siteDistribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(5),
      }],
    });

    // Grant Bedrock permission to reasoning Lambda
    reasoningLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    // Output useful values
    new cdk.CfnOutput(this, 'ApiEndpointOutput', { value: httpApi.apiEndpoint });
    new cdk.CfnOutput(this, 'CloudFrontDomainOutput', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'SiteDomainOutput', { value: siteDistribution.distributionDomainName });
    new cdk.CfnOutput(this, 'DataLakeBucketOutput', { value: dataLake.bucketName });
    new cdk.CfnOutput(this, 'FrontendBucketOutput', { value: frontendBucket.bucketName });
    new cdk.CfnOutput(this, 'KnowledgeTableOutput', { value: knowledgeTable.tableName });

  }
}
