data "archive_file" "extract_article" {
  type        = "zip"
  source_dir  = "./cloud_functions/extract-article"
  output_path = "/tmp/extract-article-${formatdate("YYMMDDhhmmss", timestamp())}"
}

resource "google_storage_bucket" "functions" {
  name     = join("-", [var.project_id, "functions"])
  location = "ASIA-NORTHEAST1"
}

resource "google_storage_bucket_object" "extract_article" {
  name   = "source-#${data.archive_file.extract_article.output_md5}.zip"
  bucket = google_storage_bucket.functions.name
  source = data.archive_file.extract_article.output_path
}

resource "google_cloudfunctions_function" "extract_article" {
  name                  = "extract-article"
  runtime               = "nodejs16"
  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.functions.name
  source_archive_object = google_storage_bucket_object.extract_article.name
  trigger_http          = true
  entry_point           = "extractArticle"
}

resource "google_cloudfunctions_function_iam_member" "extract_article" {
  project        = google_cloudfunctions_function.extract_article.project
  region         = google_cloudfunctions_function.extract_article.region
  cloud_function = google_cloudfunctions_function.extract_article.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}
