# Building Alex: Part 1 - AWS Permissions Setup

Welcome to Project Alex - the Agentic Learning Equities eXplainer! 

Alex is an AI-powered personal financial planner that will help users manage their investment portfolios and plan for retirement. Throughout this course, we'll build a complete AI system using AWS services.

## What is Alex?

Alex will help users:
- Understand their investment portfolios
- Plan for retirement
- Get personalized financial advice
- Track market trends and opportunities

## BEFORE WE START - MAJOR TIP!!

There's a file `gameplan.md` in the project root that describes the entire Alex project to an AI Agent, so that you can ask questions and get help. There's also an identical `CLAUDE.md` and `AGENTS.md` file. If you need help, simply start your favorite AI Agent, and give it this instruction:

> I am a student on the course AI in Production. We are in the course repo. Read the file `gameplan.md` for a briefing on the project. Read this file completely and read all the linked guides carefully. Do not start any work apart from reading and checking directory structure. When you have completed all reading, let me know if you have questions before we get started.

Then after answering any questions, say exactly which guide you're on, and any issues you're experiencing. Your agent will be fully educated and ready to help. Allow it to run aws and terraform commands to investigate. Be careful to validate every suggestion; always ask for the root cause of problems, and for evidence to convince you it has proven the root cause. LLMs have a tendency to jump to conclusions, but they often correct themselves when they need to provide evidence.

## Architecture Overview

Here's what you'll be building across all the guides:

```mermaid
graph TB
    User[User] -->|Research| AR[App Runner<br/>AI Researcher]
    Schedule[EventBridge<br/>Every 2 Hours] -->|Trigger| SchedLambda[Lambda<br/>Scheduler]
    SchedLambda -->|Call| AR
    AR -->|Generate| Bedrock[AWS Bedrock<br/>OSS 120B Model]
    AR -->|Store| Lambda[Lambda<br/>Ingest]
    Lambda -->|Embed| SM[SageMaker<br/>Embeddings]
    Lambda -->|Index| S3V[(S3 Vectors<br/>90% Cheaper!)]
    User -->|Search| S3V
    
    style AR fill:#FF9900
    style S3V fill:#90EE90
    style SM fill:#10B981
    style Schedule fill:#9333EA
    style SchedLambda fill:#FF9900
    style Bedrock fill:#FF9900
```

See [architecture.md](architecture.md) for the complete system architecture.

## About This Guide

This first guide focuses on setting up the necessary AWS permissions. We'll create a dedicated IAM group with only the permissions needed for the Alex project.

## Important Note on Infrastructure Management

This project uses Terraform for infrastructure deployment with a specific approach designed for educational purposes:
- **Separate Terraform directories**: Each guide has its own Terraform directory (e.g., `terraform/2_sagemaker`, `terraform/3_ingestion`)
- **Local state files**: We use local state files instead of remote S3 state for simplicity (automatically gitignored)
- **Independent deployments**: Each part can be deployed independently without affecting other parts
- **No state bucket needed**: This eliminates the complexity of setting up and managing a Terraform state bucket

This approach allows you to:
- Deploy each part as you progress through the guides
- Avoid accidental deployment of later parts
- Keep infrastructure changes isolated
- Simplify the learning experience

## Prerequisites

Before starting, ensure you have:
- An AWS account with root access
- AWS CLI installed and configured with your `aiengineer` IAM user
- Basic familiarity with AWS services
- Terraform installed (version 1.5 or later)

**Note for VS Code/Cursor users**: To view the architecture diagrams in this guide, install the "Markdown Preview Mermaid Support" extension (ID: `bierner.markdown-mermaid`). This will render the diagrams in your Markdown preview.

## Step 1: Setting Up IAM Permissions

First, we need to create proper IAM permissions for the Alex project. We'll create a dedicated IAM group with only the permissions needed for this project.

### 1.1 Sign in as Root User

1. Navigate to [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
2. Click "Sign In to the Console"
3. Select "Root user" and enter your root email address
4. Click "Next" and enter your root password

⚠️ **Security Note**: We're using the root user only for IAM setup. For all other tasks, we'll use our IAM user.

### 1.2 Create S3 Vectors Policy

Since S3 Vectors is a new service (as of 2025), we need to create a custom policy for it:

1. In the AWS Console, navigate to **IAM** (Identity and Access Management)
2. In the left sidebar, click **Policies**
3. Click **Create policy**
4. Click the **JSON** tab
5. Replace the default content with:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3vectors:*"
            ],
            "Resource": "*"
        }
    ]
}
```

6. Click **Next: Tags**, then **Next: Review**
7. For **Policy name**, enter: `AlexS3VectorsAccess`
8. For **Description**, enter: `Full access to S3 Vectors for Alex project`
9. Click **Create policy**

### 1.3 Create the AlexAccess Group

1. Still in IAM, click **User groups** in the left sidebar
2. Click the **Create group** button
3. For **Group name**, enter: `AlexAccess`
4. In the **Attach permissions policies** section, search for and select these policies:
   - `AmazonSageMakerFullAccess` (AWS managed policy)
   - `AmazonBedrockFullAccess` (AWS managed policy - for AI model access)
   - `CloudWatchEventsFullAccess` (AWS managed policy - includes EventBridge)
   - `AlexS3VectorsAccess` (the custom policy you just created)
   
   Note: We already have Lambda, S3, CloudWatch, and API Gateway permissions from other groups.

5. Click **Create group**

### 1.4 Add the Group to Your IAM User

1. Still in IAM, click **Users** in the left sidebar
2. Click on your user `aiengineer`
3. Click the **Groups** tab
4. Click **Add user to groups**
5. Select the checkbox next to `AlexAccess`
6. Click **Add to groups**

### 1.5 Sign Out and Sign Back In

1. Click your username in the top right corner
2. Click **Sign out**
3. Sign back in using your IAM user credentials:
   - Account ID or alias
   - IAM user name: `aiengineer`
   - Your IAM password

### 1.6 Verify Permissions

Let's verify you have the necessary permissions by running:

```bash
aws sts get-caller-identity
```

You should see your IAM user ARN. Next, let's check you can access SageMaker:

```bash
aws sagemaker list-endpoints
```

This should return an empty list (no error).

## Step 3: Initial Project Setup

Before moving to the next guide, let's set up your environment files:

### Create Your Environment File

```bash
# Navigate to project root
cd alex  # or wherever you cloned the repo

# Copy the example environment file
cp .env.example .env

# Get your AWS account ID
aws sts get-caller-identity --query Account --output text
```

Edit the `.env` file and add your AWS account ID and default region:
```
AWS_ACCOUNT_ID=123456789012     # Your actual account ID
DEFAULT_AWS_REGION=us-east-1    # Your preferred default region
```

You'll add more values to this file as you progress through the guides.

### Important Files

This project uses two types of configuration files:
- **`.env`** - Environment variables for Python scripts and backend services
- **`terraform.tfvars`** - Configuration for Terraform infrastructure

Both are gitignored for security. You'll create them from the provided examples.

## Next Steps

Excellent! You now have the necessary permissions and initial setup complete.

Continue to the next guide: [2_sagemaker.md](2_sagemaker.md) where we'll deploy our first AI component - a SageMaker Serverless endpoint for generating text embeddings.

This will be the foundation of Alex's ability to understand and process financial information! 🚀