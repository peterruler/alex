variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "bedrock_region" {
  description = "AWS region for Bedrock (may differ from main region)"
  type        = string
  default     = "us-west-2"
}

variable "bedrock_model_id" {
  description = "Bedrock model ID to monitor (e.g., amazon.nova-pro-v1:0)"
  type        = string
  default     = "amazon.nova-pro-v1:0"
}