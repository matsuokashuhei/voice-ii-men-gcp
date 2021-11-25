terraform {
  required_version = "1.0.11"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.1.0"
    }
  }
  backend "gcs" {
    bucket = "voice-ii-men-333213-tfstate"
    prefix = "env/dev"
  }
}
