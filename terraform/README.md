# Terraform Infrastructure

This directory contains Terraform configurations for the Alex Financial Planner project.

## Structure

Each part of the course has its own independent Terraform directory:

- **`2_sagemaker/`** - SageMaker serverless endpoint for embeddings (Guide 2)
- **`3_ingestion/`** - S3 Vectors, Lambda, and API Gateway for document ingestion (Guide 3)
- **`4_researcher/`** - App Runner service for AI researcher agent (Guide 4)
- **`5_database/`** - Aurora Serverless v2 PostgreSQL with Data API (Guide 5)
- **`6_agents/`** - Lambda functions for agent orchestra (Guide 6)
- **`7_frontend/`** - API Lambda and frontend infrastructure (Guide 7)
- **`8_observability/`** - LangFuse and monitoring setup (Guide 8)

## Key Design Decisions

### Why Separate Directories?

1. **Educational Clarity**: Each guide corresponds to exactly one Terraform directory
2. **Independent Deployment**: Students can deploy each part without affecting others
3. **Reduced Risk**: Mistakes in one part don't impact previously deployed infrastructure
4. **Progressive Learning**: Can't accidentally deploy later parts before completing earlier ones

### Why Local State?

1. **Simplicity**: No need to set up and manage an S3 state bucket
2. **Zero Dependencies**: Can start deploying immediately without prerequisite infrastructure
3. **Cost Savings**: No S3 storage costs for state files
4. **Security**: State files are automatically gitignored

## Usage

For each part of the course:

```bash
# Navigate to the specific part's directory
cd terraform/2_sagemaker  # (or 3_ingestion, 4_researcher, etc.)

# Initialize Terraform (only needed once per directory)
terraform init

# Review what will be created
terraform plan

# Deploy the infrastructure
terraform apply

# When done with that part (optional)
terraform destroy
```

## Environment Variables

Some Terraform configurations require environment variables from your `.env` file:

- `OPENAI_API_KEY` - For the researcher agent (Part 4)
- `ALEX_API_ENDPOINT` - API Gateway endpoint (from Part 3)
- `ALEX_API_KEY` - API key for ingestion (from Part 3)
- `AURORA_CLUSTER_ARN` - Aurora cluster ARN (from Part 5)
- `AURORA_SECRET_ARN` - Secrets Manager ARN (from Part 5)
- `VECTOR_BUCKET` - S3 Vectors bucket name (from Part 3)
- `BEDROCK_MODEL_ID` - Bedrock model to use (Part 6)

## State Management

- Each directory maintains its own `terraform.tfstate` file
- State files are stored locally (not in S3)
- All `*.tfstate` files are gitignored for security
- Back up state files before making major changes

## Production Considerations

This structure is optimized for learning. In production, you might consider:

- **Remote State**: Store state in S3 with state locking via DynamoDB
- **Modules**: Share common configurations across environments
- **Workspaces**: Manage multiple environments (dev, staging, prod)
- **CI/CD**: Automated deployment pipelines
- **Terragrunt**: Orchestrate multiple Terraform configurations

## Troubleshooting

If you encounter issues:

1. **State Conflicts**: Each directory has independent state. If you need to import existing resources:
   ```bash
   terraform import <resource_type>.<resource_name> <resource_id>
   ```

2. **Missing Dependencies**: Ensure you've completed earlier guides and have the required environment variables

3. **Clean Slate**: To start over in any directory:
   ```bash
   terraform destroy  # Remove resources
   rm -rf .terraform terraform.tfstate*  # Clean local files
   terraform init  # Reinitialize
   ```

## Cleanup Helper

To clean up old monolithic Terraform files (if upgrading from an older version):

```bash
cd terraform
python cleanup_old_structure.py
```

This will identify old files that can be safely removed.