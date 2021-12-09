locals {
  functions = {
    parse_article = {
      id          = "parse-article"
      entry_point = "parseArticle"
      version     = "20211206-1"
      environment_variables = {
      }
    }
    create_article = {
      id          = "create-article"
      entry_point = "createArticle"
      version     = "20211206-1"
      environment_variables = {
      }
    }
    add_audio = {
      id          = "add-audio"
      entry_point = "addAudio"
      version     = "20211206-1"
      environment_variables = {
        STORAGE_BUCKET = "voice-ii-men-333213-audio"
      }
    }
    get_article = {
      id          = "get-article"
      entry_point = "getArticle"
      version     = "20211206-1"
      environment_variables = {
      }
    }
    get_articles = {
      id          = "get-articles"
      entry_point = "getArticles"
      version     = "20211206-1"
      environment_variables = {
      }
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
  timeout               = 120
  entry_point           = each.value.entry_point
  environment_variables = each.value.environment_variables
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
