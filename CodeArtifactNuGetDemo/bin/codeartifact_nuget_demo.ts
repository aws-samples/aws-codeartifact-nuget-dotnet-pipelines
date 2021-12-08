#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CodeArtifactStack } from '../lib/codeartifact_stack';
import { SampleLibPipelineStack } from "../lib/samplelib_pipeline_stack";
import { SampleAppPipelineStack } from "../lib/sampleapp_pipeline_stack";

const DEMO_PREFIX = "CodeArtifactNuGetDemo";
const CODEARTIFACT_DOMAIN_NAME = "sample-org";
const CODEARTIFACT_REPOSITORY_NAME = "shared-packages";
const S3_BUCKET_NAME = `${DEMO_PREFIX.toLowerCase()}-${process.env.CDK_DEFAULT_ACCOUNT}-${process.env.CDK_DEFAULT_REGION}`;

const app = new cdk.App();

let codeArtifactStack = new CodeArtifactStack(app, DEMO_PREFIX + '-CodeArtifact', CODEARTIFACT_DOMAIN_NAME, CODEARTIFACT_REPOSITORY_NAME, S3_BUCKET_NAME, {
  description: "AWS CodeArtifact domain and repository.",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

let libPipeline = new SampleLibPipelineStack(app,
  DEMO_PREFIX + '-SampleLibPipeline',
  CODEARTIFACT_DOMAIN_NAME,
  CODEARTIFACT_REPOSITORY_NAME,
  S3_BUCKET_NAME,
  {
    description: "A build pipeline that creates the SampleLib NuGet package and publishes it to AWS CodeArtifact.",
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION
    }
  });

let appPipeline = new SampleAppPipelineStack(app,
  DEMO_PREFIX + '-SampleAppPipeline',
  CODEARTIFACT_DOMAIN_NAME,
  CODEARTIFACT_REPOSITORY_NAME,
  S3_BUCKET_NAME,
  {
    description: "A build pipeline for SampleApp that demonstrates restoring the SampleLib NuGet package from AWS CodeArtifact.",
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION
    }
  });

libPipeline.addDependency(codeArtifactStack);
appPipeline.addDependency(libPipeline);
