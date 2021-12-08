import * as cdk from '@aws-cdk/core';
import { DemoPipelineStack } from "./demo_util";

export class SampleLibPipelineStack extends DemoPipelineStack {
  constructor(scope: cdk.Construct, id: string, codeArtifactDomainName: string, codeArtifactRepositoryName: string, s3BucketName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.codeArtifactDomainName = codeArtifactDomainName;
    this.codeArtifactRepositoryName = codeArtifactRepositoryName;
    this.s3BucketName = s3BucketName;

    this.setupSourceRepository("SampleLib", "Sample .NET library that is distributed as a NuGet package with AWS CodeArtifact");
    this.setupBuildPipeline("Publishes the SampleLib NuGet package to CodeArtifact");
    let allowPublishing = true;
    this.grantBuildPermissionToCodeArtifact(allowPublishing);
  }
}
