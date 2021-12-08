# Sample: Distribute private .NET NuGet packages with AWS CodeArtifact

This repository contains code to deploy two sample pipelines. One pipline publishes a NuGet package called SampleLib to a CodeArtifact repository. The other pipeline restores the SampleLib NuGet package from CodeArtifact repository to build a .NET console application named SampleApp.

## Getting Started

### Requirements

- Node.js with NPM
- AWS credentials configured in a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html). The profile name `MyProfile` is used an example for this demo.
- AWS account number - The account number `111111111111` is used for demo purposes.

You can create both pipelines with a single CDK deployment.

### Deploy the demo to your AWS account

```bash
cd CodeArtifactNuGetDemo
npm install
export AWS_PROFILE=MyProfile
export AWS_DEFAULT_REGION=us-east-2
npx cdk bootstrap aws://111111111111/us-east-2
npx cdk deploy --all
```

The CodeArtifactNuGetDemo CDK applicataion deploys the resources below.

Name | Type of Resource | Description
-- | -- | --
| CodeArtifactNuGetDemo-Repository | CodeArtifact repository | Stores the SampleLib NuGet package
| CodeArtifactNuGetDemo-SampleLib | CodeCommit repository | A sample C# library
| CodeArtifactNuGetDemo-SampleApp | CodeCommit repository | A sample C# app that depends on SampleLib
| CodeArtifactNuGetDemo-SampleLibPublishPipeline | CodePipeline | A pipeline that builds SampleLib as a NuGet package and publishes it to the CodeArtifact repository
| CodeArtifactNuGetDemo-SampleAppConsumePipeline | CodePipeline | A pipeline that builds SampleApp and consumes the SampleLib NuGet package from the CodeArtifact repository

### Cleanup

When you are finished with the demo, you can clean it up by running the command below.

```bash
npx cdk destroy --all
```

## Code in this Repository

### SampleLib/

This directory contains an example of a .NET library that is published as a NuGet package to a CodeArtifact repository.

### SampleApp/

This directory contains an example of a .NET application that depends on the SampleLib NuGet package. It restores the SampleLib NuGet package from a CodeArtifact repository.

### CodeArtifactNuGetDemo/

This directory contains a CDK application that deploys the demo resources to your AWS account.
