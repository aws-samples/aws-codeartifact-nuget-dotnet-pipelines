import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { CfnDomain, CfnRepository } from "@aws-cdk/aws-codeartifact";
import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3";

export class CodeArtifactStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, domainName: string, repositoryName: string, s3BucketName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let domain = new CfnDomain(this, "Domain", { domainName });

    new CfnRepository(this, "Repository", {
      domainName: domain.attrName,
      repositoryName: repositoryName,
      description: "Packages available to all app teams at example.org",
      externalConnections: [
        'public:nuget-org'
      ]
    });

    new Bucket(this, "DemoBucket", {
      bucketName: s3BucketName,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true
    });

    new CfnOutput(this, "NuGetFeed", {
      description: "NuGet endpoint for CodeArtifact repository",
      value: `https://${domainName}-${this.account}.d.codeartifact.${this.region}.amazonaws.com/nuget/${repositoryName}/v3/index.json`
    });
  }
}
