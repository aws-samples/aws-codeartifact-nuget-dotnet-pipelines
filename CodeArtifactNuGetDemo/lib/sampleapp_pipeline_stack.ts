import * as cdk from '@aws-cdk/core';
import { DemoPipelineStack } from "./demo_util";

export class SampleAppPipelineStack extends DemoPipelineStack {
  constructor(scope: cdk.Construct, id: string, codeArtifactDomainName: string, codeArtifactRepositoryName: string, s3BucketName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.codeArtifactDomainName = codeArtifactDomainName;
    this.codeArtifactRepositoryName = codeArtifactRepositoryName;
    this.s3BucketName = s3BucketName;

    this.setupSourceRepository("SampleApp", "Sample .NET app that specifies a dependency on the SampleLib NuGet package.");
    this.setupBuildPipeline("Builds and runs SampleApp to demonstrate how the SampleLib NuGet package is successfully downloaded from CodeArtifact.");
    let allowPublishing = false;
    this.grantBuildPermissionToCodeArtifact(allowPublishing);
  }
}
