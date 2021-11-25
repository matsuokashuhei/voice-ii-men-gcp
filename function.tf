locals {
  functions = {
    extract_article = {
      id          = "extract-article"
      entry_point = "extractArticle"
      version     = "20211125-1"
    }
    convert_text_to_speech = {
      id          = "convert-text-to-speech"
      entry_point = "convertTextToSpeech"
      version     = "20211125-1"
    }
  }
}

resource "google_storage_bucket" "functions" {
  name     = join("-", [var.project_id, "functions"])
  location = var.region
  project  = data.google_project.voice_ii_men.project_id
}

data "archive_file" "voice_ii_men" {
  for_each    = local.functions
  type        = "zip"
  source_dir  = "./cloud_functions/${each.value.id}"
  output_path = "/tmp/${each.value.id}-${each.value.version}"
}

resource "google_storage_bucket_object" "voice_ii_men" {
  for_each = local.functions
  name     = "source-${data.archive_file.voice_ii_men[each.key].output_md5}.zip"
  bucket   = google_storage_bucket.functions.name
  source   = data.archive_file.voice_ii_men[each.key].output_path
  depends_on = [
    google_storage_bucket.functions
  ]
}

resource "google_cloudfunctions_function" "voice_ii_men" {
  for_each              = local.functions
  name                  = each.value.id
  runtime               = "nodejs16"
  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.functions.name
  source_archive_object = google_storage_bucket_object.voice_ii_men[each.key].name
  trigger_http          = true
  entry_point           = each.value.entry_point
  depends_on = [
    google_storage_bucket.functions,
  ]
}

resource "google_cloudfunctions_function_iam_member" "voice_ii_men" {
  for_each       = local.functions
  project        = google_cloudfunctions_function.voice_ii_men[each.key].project
  region         = google_cloudfunctions_function.voice_ii_men[each.key].region
  cloud_function = google_cloudfunctions_function.voice_ii_men[each.key].name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}
