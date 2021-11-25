resource "google_storage_bucket" "text_to_speech" {
  name     = join("-", [var.project_id, "text-to-speech"])
  location = var.region
  project  = data.google_project.voice_ii_men.project_id
}
