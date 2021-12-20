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

## Design

### Configuration as Code

This sample shows you how to use a **version-controlled `nuget.config` file** to publish and consume NuGet packages from CodeArtifact. This approach is useful for teams who want to reduce manual configuration of NuGet in their IDEs and track their NuGet configuration in source control. Please note that this is an alternative approach compared to the approach used in the [CodeArtifact User Guide](https://docs.aws.amazon.com/codeartifact/latest/ug/using-nuget-packages-in-codebuild.html) where NuGet configuration is dynamically modified using commands like `dotnet nuget add source`.

Using a **version-controlled `nuget.config` file** instead of commands that dynamically modify NuGet configuration adds several benefits.
1. Simplicity: First, a version-controlled `nuget.config` can be defined once for your project. Other team members and your CI/CD pipeline can all use the same NuGet / CodeArtifact configuration file. This reduces the manual steps necessary to configure NuGet for each team member's IDE.
2. Safety: A version-controlled configuration enables you to track the history of configuration changes and gain visbility into new configuration changes as they are introduced.

This code sample dynamically generates a _version-controlled_ `nuget.config` in the SampleLib and SampleApp code repositories that it creates. To see what a version-controlled `nuget.config` file would look like inside your team's project, navigate to the `CodeArtifactNuGetDemo-SampleLib` repository or the `CodeArtifactNuGetDemo-SampleApp` repository in the AWS Console and open the `nuget.config` file.

## Code in this Repository

### SampleLib/

This directory contains an example of a .NET library that is published as a NuGet package to a CodeArtifact repository.

### SampleApp/

This directory contains an example of a .NET application that depends on the SampleLib NuGet package. It restores the SampleLib NuGet package from a CodeArtifact repository.

### CodeArtifactNuGetDemo/

This directory contains a CDK application that deploys the demo resources to your AWS account.
