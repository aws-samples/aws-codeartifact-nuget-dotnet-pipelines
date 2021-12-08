import * as fs from "fs";
import * as path from "path";
import { Arn, ArnFormat, CfnOutput, FileSystem, IgnoreMode } from "@aws-cdk/core";
import * as cdk from "@aws-cdk/core";
import { CfnRepository, Repository } from "@aws-cdk/aws-codecommit";
import { ComputeType, LinuxBuildImage, Project, Source } from "@aws-cdk/aws-codebuild";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import { Bucket } from "@aws-cdk/aws-s3";
import { CodeBuildAction, CodeCommitSourceAction } from "@aws-cdk/aws-codepipeline-actions";
import { Asset } from "@aws-cdk/aws-s3-assets";

/**
 * Creates a CDK stack with a git repository and a build pipeline.
 */
export class DemoPipelineStack extends cdk.Stack {

  protected codeArtifactDomainName: string;
  protected codeArtifactRepositoryName: string;
  protected s3BucketName: string;
  private sourceRepository: Repository;
  private buildProject: Project;

  /**
   * Grants the 'Build' step of this CodePipeline access to CodeArtifact.
   */
  protected grantBuildPermissionToCodeArtifact(allowPublish: boolean) {
    let codeArtifactDomainArn = Arn.format({
      service: "codeartifact",
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
      resource: "domain",
      resourceName: this.codeArtifactDomainName
    }, this);

    let codeArtifactRepositoryArn = Arn.format({
      service: "codeartifact",
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
      resource: "repository",
      resourceName: `${this.codeArtifactDomainName}/${this.codeArtifactRepositoryName}`
    }, this);

    let codeArtifactActions: string[];

    if (allowPublish) {
      codeArtifactActions = [
        "codeartifact:PublishPackageVersion",
        "codeartifact:ReadFromRepository",
        "codeartifact:GetAuthorizationToken"
      ];
    } else {
      codeArtifactActions = [
        "codeartifact:ReadFromRepository",
        "codeartifact:GetAuthorizationToken"
      ];
    }

    this.buildProject.addToRolePolicy(new PolicyStatement({
      actions: codeArtifactActions,
      resources: [
        codeArtifactDomainArn,
        codeArtifactRepositoryArn,
        `arn:aws:codeartifact:${this.region}:${this.account}:package/${this.codeArtifactDomainName}/*`,
      ]
    }));

    this.buildProject.addToRolePolicy(new PolicyStatement({
      actions: [
        "sts:GetServiceBearerToken"
      ],
      resources: ["*"],
      conditions: {
        "StringEquals": {
          "sts:AWSServiceName": "codeartifact.amazonaws.com"
        }
      }
    }));
  }

  /**
   * Creates a CodePipeline with two stages "Source" and "Build"
   */
  protected setupBuildPipeline(description: string) {
    this.buildProject = new Project(this, 'Build', {
      source: Source.codeCommit({
        repository: this.sourceRepository
      }),
      projectName: this.stackName + '-Build',
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL
      },
      description: description,
    });

    let pipeline = new Pipeline(this, "Pipeline", {
      pipelineName: this.stackName,
      artifactBucket: Bucket.fromBucketName(this, "Bucket", this.s3BucketName)
    });

    let code = Artifact.artifact("code");

    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodeCommitSourceAction({
          actionName: "Source",
          output: code,
          repository: this.sourceRepository,
          branch: "main"
        })
      ],
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "Build",
          input: code,
          project: this.buildProject
        })
      ],
    });

    new CfnOutput(this, "PipelineUrl", {
      description: "Link to deployment pipeline in AWS Console",
      value: `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.pipelineName}/view?region=${this.region}`
    });
  }

  /**
   * Creates the file ${destinationPath}/nuget.config from the template file at ${sourcePath}/nuget.template.config.
   */
  protected renderNuGetConfigFromTemplate(sourcePath: string, destinationPath: string) {
    let nugetConfigContents = fs.readFileSync(path.join(sourcePath, "nuget.template.config")).toString("utf-8");
    nugetConfigContents = nugetConfigContents.replace(/AWS_REGION/g, this.region);
    nugetConfigContents = nugetConfigContents.replace(/AWS_ACCOUNT/g, this.account);
    nugetConfigContents = nugetConfigContents.replace(/CODEARTIFACT_DOMAIN_NAME/g, this.codeArtifactDomainName);
    nugetConfigContents = nugetConfigContents.replace(/CODEARTIFACT_REPOSITORY_NAME/g, this.codeArtifactRepositoryName);
    fs.writeFileSync(path.join(destinationPath, "nuget.config"), nugetConfigContents);
  }

  /**
   * Creates a CodeCommit repository from files located under a directory named ../${appName}.
   */
  protected setupSourceRepository(appName: string, description: string) {

    let demoCodeLocalPath = path.join(process.cwd(), "../", appName);
    let demoCodeTmpPath = FileSystem.mkdtemp(appName);

    FileSystem.copyDirectory(demoCodeLocalPath, demoCodeTmpPath, {
      ignoreMode: IgnoreMode.GLOB,
      exclude: [
        'bin',
        'obj',
        'nuget.template.config'
      ]
    });

    this.renderNuGetConfigFromTemplate(demoCodeLocalPath, demoCodeTmpPath);

    this.sourceRepository = new Repository(this, "SourceRepository", {
      repositoryName: this.stackName,
      description: description,
    });

    let initialSourceCode = new Asset(this, "SourceCode", {
      path: demoCodeTmpPath
    });

    let libSourceResource = this.sourceRepository.node.defaultChild as CfnRepository;
    libSourceResource.code = {
      s3: {
        bucket: initialSourceCode.s3BucketName,
        key: initialSourceCode.s3ObjectKey,
      }
    }

    new CfnOutput(this, "RepositoryUrl", {
      description: "Link to git repository in AWS Console",
      value: `https://${this.region}.console.aws.amazon.com/codesuite/codecommit/repositories/${this.sourceRepository.repositoryName}/browse?region=${this.region}`
    });
  }
}
