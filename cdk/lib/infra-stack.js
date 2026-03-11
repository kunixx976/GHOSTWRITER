"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfraStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const aws_cdk_lib_1 = require("aws-cdk-lib");
class InfraStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ---------- S3 Data Lake ----------
        const dataLake = new aws_cdk_lib_1.aws_s3.Bucket(this, 'DataLakeBucket', {
            bucketName: cdk.Stack.of(this).stackName.toLowerCase() + '-datalake',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            lifecycleRules: [{
                    abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
                    expiration: cdk.Duration.days(365),
                    transitions: [{
                            storageClass: aws_cdk_lib_1.aws_s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(30),
                        }],
                }],
            cors: [{
                    allowedMethods: [aws_cdk_lib_1.aws_s3.HttpMethods.GET, aws_cdk_lib_1.aws_s3.HttpMethods.PUT, aws_cdk_lib_1.aws_s3.HttpMethods.POST],
                    allowedOrigins: ['*'],
                    allowedHeaders: ['*'],
                }],
        });
        // ---------- DynamoDB Knowledge Vault ----------
        const knowledgeTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'KnowledgeTable', {
            tableName: cdk.Stack.of(this).stackName.toLowerCase() + '-knowledge',
            partitionKey: { name: 'docId', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            sortKey: { name: 'chunkId', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // ---------- Lambda Functions ----------
        const ingestionLambda = new aws_cdk_lib_1.aws_lambda.Function(this, 'IngestionLambda', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            handler: 'ingestion.handler',
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            timeout: cdk.Duration.minutes(5),
            environment: {
                DATA_LAKE_BUCKET: dataLake.bucketName,
                KNOWLEDGE_TABLE: knowledgeTable.tableName,
            },
        });
        const reasoningLambda = new aws_cdk_lib_1.aws_lambda.Function(this, 'ReasoningLambda', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            handler: 'reasoning.handler',
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
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
        const httpApi = new aws_cdk_lib_1.aws_apigatewayv2.HttpApi(this, 'GhostwriterHttpApi', {
            apiName: 'GhostwriterAPI',
            corsPreflight: {
                allowHeaders: ['Content-Type', 'Authorization'],
                allowMethods: [aws_cdk_lib_1.aws_apigatewayv2.CorsHttpMethod.GET, aws_cdk_lib_1.aws_apigatewayv2.CorsHttpMethod.POST, aws_cdk_lib_1.aws_apigatewayv2.CorsHttpMethod.OPTIONS],
                allowOrigins: ['*'],
                maxAge: cdk.Duration.days(10),
            },
        });
        // Integrations
        const ingestIntegration = new aws_cdk_lib_1.aws_apigatewayv2_integrations.HttpLambdaIntegration('IngestIntegration', ingestionLambda);
        const reasonIntegration = new aws_cdk_lib_1.aws_apigatewayv2_integrations.HttpLambdaIntegration('ReasonIntegration', reasoningLambda);
        httpApi.addRoutes({
            path: '/ingest',
            methods: [aws_cdk_lib_1.aws_apigatewayv2.HttpMethod.POST],
            integration: ingestIntegration,
        });
        httpApi.addRoutes({
            path: '/reason',
            methods: [aws_cdk_lib_1.aws_apigatewayv2.HttpMethod.POST],
            integration: reasonIntegration,
        });
        // ---------- CloudFront Distribution ----------
        const origin = new aws_cdk_lib_1.aws_cloudfront_origins.HttpOrigin(httpApi.apiEndpoint.replace('https://', ''), {
            protocolPolicy: aws_cdk_lib_1.aws_cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        });
        const distribution = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'FrontendDistribution', {
            defaultBehavior: {
                origin: origin,
                cachePolicy: aws_cdk_lib_1.aws_cloudfront.CachePolicy.CACHING_DISABLED,
                viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: aws_cdk_lib_1.aws_cloudfront.AllowedMethods.ALLOW_ALL,
                originRequestPolicy: aws_cdk_lib_1.aws_cloudfront.OriginRequestPolicy.ALL_VIEWER,
            },
            errorResponses: [{
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5),
                }],
        });
        // Frontend bucket for static site
        const frontendBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'FrontendBucket', {
            bucketName: cdk.Stack.of(this).stackName.toLowerCase() + '-frontend',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // CloudFront distribution for static site
        const siteDistribution = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'SiteDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(frontendBucket),
                viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: aws_cdk_lib_1.aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            errorResponses: [{
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(5),
                }],
        });
        // Grant Bedrock permission to reasoning Lambda
        reasoningLambda.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
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
exports.InfraStack = InfraStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMsNkNBQTZRO0FBRTdRLE1BQWEsVUFBVyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3ZDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIscUNBQXFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3JELFVBQVUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsV0FBVztZQUNwRSxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsY0FBYyxFQUFFLENBQUM7b0JBQ2YsbUNBQW1DLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxVQUFVLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNsQyxXQUFXLEVBQUUsQ0FBQzs0QkFDWixZQUFZLEVBQUUsb0JBQUUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCOzRCQUMvQyxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3lCQUN2QyxDQUFDO2lCQUNILENBQUM7WUFDRixJQUFJLEVBQUUsQ0FBQztvQkFDTCxjQUFjLEVBQUUsQ0FBQyxvQkFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsb0JBQUUsQ0FBQyxXQUFXLENB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QUFlLENBQUM7WUFDdEQsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDaEMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUosdUJBQXVCO1FBQ3ZCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1FBQ2xHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDaEYsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN0RixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRXZGLENBQUM7Q0FDRjtBQWxKRCxnQ0FrSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMsIGF3c19keW5hbW9kYiBhcyBkeW5hbW9kYiwgYXdzX2xhbWJkYSBhcyBsYW1iZGEsIGF3c19hcGlnYXRld2F5djIgYXMgYXBpZ2F0ZXdheSwgYXdzX2FwaWdhdGV3YXl2Ml9pbnRlZ3JhdGlvbnMgYXMgaW50ZWdyYXRpb25zLCBhd3NfY2xvdWRmcm9udCBhcyBjbG91ZGZyb250LCBhd3NfY2xvdWRmcm9udF9vcmlnaW5zIGFzIG9yaWdpbnMsIGF3c19pYW0gYXMgaWFtLCBhd3NfbG9ncyBhcyBsb2dzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgY2xhc3MgSW5mcmFTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIC0tLS0tLS0tLS0gUzMgRGF0YSBMYWtlIC0tLS0tLS0tLS1cbiAgICBjb25zdCBkYXRhTGFrZSA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0RhdGFMYWtlQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogY2RrLlN0YWNrLm9mKHRoaXMpLnN0YWNrTmFtZS50b0xvd2VyQ2FzZSgpICsgJy1kYXRhbGFrZScsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICBsaWZlY3ljbGVSdWxlczogW3tcbiAgICAgICAgYWJvcnRJbmNvbXBsZXRlTXVsdGlwYXJ0VXBsb2FkQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDcpLFxuICAgICAgICBleHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygzNjUpLFxuICAgICAgICB0cmFuc2l0aW9uczogW3tcbiAgICAgICAgICBzdG9yYWdlQ2xhc3M6IHMzLlN0b3JhZ2VDbGFzcy5JTkZSRVFVRU5UX0FDQ0VTUyxcbiAgICAgICAgICB0cmFuc2l0aW9uQWZ0ZXI6IGNkay5EdXJhdGlvbi5kYXlzKDMwKSxcbiAgICAgICAgfV0sXG4gICAgICB9XSxcbiAgICAgIGNvcnM6IFt7XG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBbczMuSHR0cE1ldGhvZHMuR0VULCBzMy5IdHRwTWV0aG9kcy5QVVQsIHMzLkh0dHBNZXRob2RzLlBPU1RdLFxuICAgICAgICBhbGxvd2VkT3JpZ2luczogWycqJ10sXG4gICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJyonXSxcbiAgICAgIH1dLFxuICAgIH0pO1xuXG4gICAgLy8gLS0tLS0tLS0tLSBEeW5hbW9EQiBLbm93bGVkZ2UgVmF1bHQgLS0tLS0tLS0tLVxuICAgIGNvbnN0IGtub3dsZWRnZVRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdLbm93bGVkZ2VUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogY2RrLlN0YWNrLm9mKHRoaXMpLnN0YWNrTmFtZS50b0xvd2VyQ2FzZSgpICsgJy1rbm93bGVkZ2UnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdkb2NJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdjaHVua0lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gLS0tLS0tLS0tLSBMYW1iZGEgRnVuY3Rpb25zIC0tLS0tLS0tLS1cbiAgICBjb25zdCBpbmdlc3Rpb25MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbmdlc3Rpb25MYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcbiAgICAgIGhhbmRsZXI6ICdpbmdlc3Rpb24uaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBEQVRBX0xBS0VfQlVDS0VUOiBkYXRhTGFrZS5idWNrZXROYW1lLFxuICAgICAgICBLTk9XTEVER0VfVEFCTEU6IGtub3dsZWRnZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCByZWFzb25pbmdMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdSZWFzb25pbmdMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcbiAgICAgIGhhbmRsZXI6ICdyZWFzb25pbmcuaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBLTk9XTEVER0VfVEFCTEU6IGtub3dsZWRnZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBsZWFzdOKAkXByaXZpbGVnZSBwZXJtaXNzaW9uc1xuICAgIGRhdGFMYWtlLmdyYW50UmVhZFdyaXRlKGluZ2VzdGlvbkxhbWJkYSk7XG4gICAga25vd2xlZGdlVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGluZ2VzdGlvbkxhbWJkYSk7XG4gICAga25vd2xlZGdlVGFibGUuZ3JhbnRSZWFkRGF0YShyZWFzb25pbmdMYW1iZGEpO1xuXG4gICAgLy8gLS0tLS0tLS0tLSBBUEkgR2F0ZXdheSAoSFRUUCBBUEkpIC0tLS0tLS0tLS1cbiAgICBjb25zdCBodHRwQXBpID0gbmV3IGFwaWdhdGV3YXkuSHR0cEFwaSh0aGlzLCAnR2hvc3R3cml0ZXJIdHRwQXBpJywge1xuICAgICAgYXBpTmFtZTogJ0dob3N0d3JpdGVyQVBJJyxcbiAgICAgIGNvcnNQcmVmbGlnaHQ6IHtcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ10sXG4gICAgICAgIGFsbG93TWV0aG9kczogW2FwaWdhdGV3YXkuQ29yc0h0dHBNZXRob2QuR0VULCBhcGlnYXRld2F5LkNvcnNIdHRwTWV0aG9kLlBPU1QsIGFwaWdhdGV3YXkuQ29yc0h0dHBNZXRob2QuT1BUSU9OU10sXG4gICAgICAgIGFsbG93T3JpZ2luczogWycqJ10sXG4gICAgICAgIG1heEFnZTogY2RrLkR1cmF0aW9uLmRheXMoMTApLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEludGVncmF0aW9uc1xuICAgIGNvbnN0IGluZ2VzdEludGVncmF0aW9uID0gbmV3IGludGVncmF0aW9ucy5IdHRwTGFtYmRhSW50ZWdyYXRpb24oJ0luZ2VzdEludGVncmF0aW9uJywgaW5nZXN0aW9uTGFtYmRhKTtcbiAgICBjb25zdCByZWFzb25JbnRlZ3JhdGlvbiA9IG5ldyBpbnRlZ3JhdGlvbnMuSHR0cExhbWJkYUludGVncmF0aW9uKCdSZWFzb25JbnRlZ3JhdGlvbicsIHJlYXNvbmluZ0xhbWJkYSk7XG5cbiAgICBodHRwQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiAnL2luZ2VzdCcsXG4gICAgICBtZXRob2RzOiBbYXBpZ2F0ZXdheS5IdHRwTWV0aG9kLlBPU1RdLFxuICAgICAgaW50ZWdyYXRpb246IGluZ2VzdEludGVncmF0aW9uLFxuICAgIH0pO1xuICAgIGh0dHBBcGkuYWRkUm91dGVzKHtcbiAgICAgIHBhdGg6ICcvcmVhc29uJyxcbiAgICAgIG1ldGhvZHM6IFthcGlnYXRld2F5Lkh0dHBNZXRob2QuUE9TVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogcmVhc29uSW50ZWdyYXRpb24sXG4gICAgfSk7XG5cblxuICAgIC8vIC0tLS0tLS0tLS0gQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gLS0tLS0tLS0tLVxuICAgIGNvbnN0IG9yaWdpbiA9IG5ldyBvcmlnaW5zLkh0dHBPcmlnaW4oaHR0cEFwaS5hcGlFbmRwb2ludC5yZXBsYWNlKCdodHRwczovLycsICcnKSwge1xuICAgICAgcHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUFNfT05MWSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnRnJvbnRlbmREaXN0cmlidXRpb24nLCB7XG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBvcmlnaW4sXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5BTExfVklFV0VSLFxuICAgICAgfSxcbiAgICAgIGVycm9yUmVzcG9uc2VzOiBbe1xuICAgICAgICBodHRwU3RhdHVzOiA0MDQsXG4gICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICB0dGw6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgfV0sXG4gICAgfSk7XG5cbiAgICAvLyBGcm9udGVuZCBidWNrZXQgZm9yIHN0YXRpYyBzaXRlXG4gICAgY29uc3QgZnJvbnRlbmRCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdGcm9udGVuZEJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IGNkay5TdGFjay5vZih0aGlzKS5zdGFja05hbWUudG9Mb3dlckNhc2UoKSArICctZnJvbnRlbmQnLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gZm9yIHN0YXRpYyBzaXRlXG4gICAgY29uc3Qgc2l0ZURpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnU2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiAnaW5kZXguaHRtbCcsXG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihmcm9udGVuZEJ1Y2tldCksXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBjYWNoZVBvbGljeTogY2xvdWRmcm9udC5DYWNoZVBvbGljeS5DQUNISU5HX09QVElNSVpFRCxcbiAgICAgIH0sXG4gICAgICBlcnJvclJlc3BvbnNlczogW3tcbiAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcbiAgICAgICAgdHRsOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgIH1dLFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgQmVkcm9jayBwZXJtaXNzaW9uIHRvIHJlYXNvbmluZyBMYW1iZGFcbiAgICByZWFzb25pbmdMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFsnYmVkcm9jazpJbnZva2VNb2RlbCddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICAvLyBPdXRwdXQgdXNlZnVsIHZhbHVlc1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlFbmRwb2ludE91dHB1dCcsIHsgdmFsdWU6IGh0dHBBcGkuYXBpRW5kcG9pbnQgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnREb21haW5PdXRwdXQnLCB7IHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU2l0ZURvbWFpbk91dHB1dCcsIHsgdmFsdWU6IHNpdGVEaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGF0YUxha2VCdWNrZXRPdXRwdXQnLCB7IHZhbHVlOiBkYXRhTGFrZS5idWNrZXROYW1lIH0pO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdGcm9udGVuZEJ1Y2tldE91dHB1dCcsIHsgdmFsdWU6IGZyb250ZW5kQnVja2V0LmJ1Y2tldE5hbWUgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0tub3dsZWRnZVRhYmxlT3V0cHV0JywgeyB2YWx1ZToga25vd2xlZGdlVGFibGUudGFibGVOYW1lIH0pO1xuXG4gIH1cbn1cbiJdfQ==